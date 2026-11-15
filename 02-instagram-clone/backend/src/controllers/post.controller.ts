import { Response } from 'express';
import { AuthenticatedInstaRequest } from '../middleware/auth.middleware';
import { instaStore, InstaPost, InstaReaction, InstaComment } from '../services/store.service';
import { MediaProcessorService } from '../services/media-processor.service';
import { HashtagService } from '../services/hashtag.service';
import { PrivacyService } from '../services/privacy.service';

export class PostController {
  static createPost(req: AuthenticatedInstaRequest, res: Response): void {
    try {
      const authorId = req.user!.id;
      const { caption, location, media } = req.body;

      const postId = `post_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      // Validate media slides
      const processed = MediaProcessorService.processMedia(media, postId);
      if (processed.status === 'FAILED') {
        res.status(400).json({ error: 'Valid media items (image or video) are required' });
        return;
      }

      // Extract & register hashtags
      const tags = HashtagService.extractHashtags(caption || '');
      HashtagService.registerHashtags(tags);

      const post: InstaPost = {
        id: postId,
        authorId,
        caption: caption || '',
        location: location || null,
        status: processed.status,
        createdAt: new Date(),
        updatedAt: new Date(),
        media: processed.media,
      };
      instaStore.posts.unshift(post);

      res.status(201).json({ post, tags });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static getFeed(req: AuthenticatedInstaRequest, res: Response): void {
    const viewerId = req.user!.id;

    // Accounts followed by viewer + viewer themselves
    const followedIds = new Set(
      instaStore.follows.filter((f) => f.followerId === viewerId).map((f) => f.followingId)
    );
    followedIds.add(viewerId);

    // Strictly enforce status = 'READY'
    const feedPosts = instaStore.posts
      .filter((p) => p.status === 'READY')
      .filter((p) => followedIds.has(p.authorId) && !PrivacyService.isBlocked(viewerId, p.authorId))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((p) => {
        const author = instaStore.users.find((u) => u.id === p.authorId);
        const profile = instaStore.profiles.find((prof) => prof.userId === p.authorId);
        const reactions = instaStore.reactions.filter((r) => r.postId === p.id);
        const isLiked = reactions.some((r) => r.userId === viewerId);
        const comments = instaStore.comments
          .filter((c) => c.postId === p.id)
          .map((c) => {
            const commentAuthor = instaStore.users.find((u) => u.id === c.authorId);
            return {
              id: c.id,
              author: commentAuthor?.username || 'user',
              content: c.content,
              createdAt: c.createdAt,
            };
          });

        return {
          id: p.id,
          caption: p.caption,
          location: p.location,
          media: p.media,
          createdAt: p.createdAt,
          author: {
            id: author?.id,
            username: author?.username,
            avatarUrl: profile?.avatarUrl,
            isVerified: profile?.isVerified,
          },
          likesCount: reactions.length,
          isLiked,
          comments,
        };
      });

    res.status(200).json({ feed: feedPosts });
  }

  static toggleLike(req: AuthenticatedInstaRequest, res: Response): void {
    const userId = req.user!.id;
    const postId = req.params.id as string;

    const post = instaStore.posts.find((p) => p.id === postId && p.status === 'READY');
    if (!post) {
      res.status(404).json({ error: 'Post not found or unavailable' });
      return;
    }

    const existingIndex = instaStore.reactions.findIndex(
      (r) => r.postId === postId && r.userId === userId
    );

    let isLiked = false;
    if (existingIndex !== -1) {
      instaStore.reactions.splice(existingIndex, 1);
      isLiked = false;
    } else {
      instaStore.reactions.push({
        id: `react_${Date.now()}`,
        userId,
        postId,
        createdAt: new Date(),
      });
      isLiked = true;
    }

    const totalLikes = instaStore.reactions.filter((r) => r.postId === postId).length;
    res.status(200).json({ isLiked, totalLikes });
  }

  static addComment(req: AuthenticatedInstaRequest, res: Response): void {
    const authorId = req.user!.id;
    const postId = req.params.id as string;
    const { content } = req.body;

    const post = instaStore.posts.find((p) => p.id === postId && p.status === 'READY');
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({ error: 'Comment text cannot be empty' });
      return;
    }

    const newComment: InstaComment = {
      id: `comm_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      authorId,
      postId,
      content: content.trim(),
      createdAt: new Date(),
    };
    instaStore.comments.push(newComment);

    res.status(201).json({ comment: newComment });
  }
}
