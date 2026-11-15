import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { twitterStore, TweetPost, TweetEditHistory, TweetLike, TweetRepost, TweetQuote } from '../services/store.service';
import { CharacterCounterService } from '../services/character-counter.service';
import { ThreadService } from '../services/thread.service';
import { PollService } from '../services/poll.service';
import { NotesService } from '../services/notes.service';
import { SafetyService } from '../services/safety.service';

export class PostController {
  public static async createPost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { text, parentId, pollOptions, pollDurationMinutes } = req.body;

      if (!text || typeof text !== 'string') {
        res.status(400).json({ error: 'Text content is required' });
        return;
      }

      const validation = CharacterCounterService.validate(text);
      if (!validation.valid) {
        res.status(400).json({
          error: `Post exceeds character limit. Length: ${validation.length}, Limit: 280`,
          details: validation
        });
        return;
      }

      const postId = 'post_' + Math.random().toString(36).substring(2, 9);
      let conversationId = postId;

      if (parentId) {
        const parentPost = twitterStore.posts.find(p => p.id === parentId);
        if (!parentPost) {
          res.status(404).json({ error: 'Parent post not found' });
          return;
        }

        // Check if author of parent post has blocked current user
        if (SafetyService.isBlockedBetween(userId, parentPost.authorId)) {
          res.status(403).json({ error: 'Cannot reply to this conversation' });
          return;
        }

        conversationId = parentPost.conversationId;
      }

      const post: TweetPost = {
        id: postId,
        authorId: userId,
        text,
        conversationId,
        parentId: parentId || null,
        isDeleted: false,
        isEdited: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      twitterStore.posts.push(post);

      let createdPoll = null;
      if (Array.isArray(pollOptions) && pollOptions.length >= 2) {
        createdPoll = PollService.createPoll(postId, pollOptions, pollDurationMinutes);
      }

      res.status(201).json({
        message: 'Post created successfully',
        post,
        poll: createdPoll
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async getPost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const postId = req.params.id as string;
      const currentUserId = req.user?.id;

      const post = twitterStore.posts.find(p => p.id === postId);
      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      if (currentUserId && SafetyService.isBlockedBetween(currentUserId, post.authorId)) {
        res.status(403).json({ error: 'Access denied: user is blocked' });
        return;
      }

      const author = twitterStore.users.find(u => u.id === post.authorId);
      const authorProfile = twitterStore.profiles.find(p => p.userId === post.authorId);
      const poll = PollService.getPollWithStats(twitterStore.polls.find(p => p.postId === postId)?.id || '');
      const notes = NotesService.getHelpfulNotesForPost(postId);
      const likesCount = twitterStore.likes.filter(l => l.postId === postId).length;
      const repostsCount = twitterStore.reposts.filter(r => r.postId === postId).length;
      const repliesCount = twitterStore.posts.filter(p => p.parentId === postId && !p.isDeleted).length;

      const isLiked = currentUserId ? twitterStore.likes.some(l => l.postId === postId && l.userId === currentUserId) : false;
      const isReposted = currentUserId ? twitterStore.reposts.some(r => r.postId === postId && r.userId === currentUserId) : false;

      res.status(200).json({
        post: post.isDeleted ? { ...post, text: '[This post has been deleted]' } : post,
        author: author ? { id: author.id, username: author.username, name: author.name, avatarUrl: authorProfile?.avatarUrl } : null,
        poll,
        communityNotes: notes,
        counts: { likes: likesCount, reposts: repostsCount, replies: repliesCount },
        userEngagement: { isLiked, isReposted }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async getThread(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const conversationId = req.params.conversationId as string;
      const currentUserId = req.user?.id;

      const posts = ThreadService.getOrderedThread(conversationId);
      if (posts.length === 0) {
        res.status(404).json({ error: 'Thread not found' });
        return;
      }

      // Filter blocked authors if currentUserId is set
      const visiblePosts = posts.filter(p => {
        if (!currentUserId) return true;
        return !SafetyService.isBlockedBetween(currentUserId, p.authorId);
      });

      res.status(200).json({
        conversationId,
        count: visiblePosts.length,
        posts: visiblePosts
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async editPost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const postId = req.params.id as string;
      const userId = req.user!.id;
      const { text } = req.body;

      const post = twitterStore.posts.find(p => p.id === postId);
      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      if (post.authorId !== userId) {
        res.status(403).json({ error: 'Only the author can edit this post' });
        return;
      }

      if (post.isDeleted) {
        res.status(400).json({ error: 'Cannot edit a deleted post' });
        return;
      }

      // 60-minute edit window enforcement
      const ageMs = Date.now() - post.createdAt.getTime();
      const sixtyMinutesMs = 60 * 60 * 1000;
      if (ageMs > sixtyMinutesMs) {
        res.status(400).json({ error: 'Editing window (60 minutes) has expired' });
        return;
      }

      const validation = CharacterCounterService.validate(text);
      if (!validation.valid) {
        res.status(400).json({ error: 'Edited post exceeds character limit', details: validation });
        return;
      }

      // Archive previous version into edit history
      const historyEntry: TweetEditHistory = {
        id: 'hist_' + Math.random().toString(36).substring(2, 9),
        postId: post.id,
        text: post.text,
        editedAt: new Date()
      };
      twitterStore.editHistories.push(historyEntry);

      post.text = text;
      post.isEdited = true;
      post.updatedAt = new Date();

      res.status(200).json({
        message: 'Post updated successfully',
        post
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async deletePost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const postId = req.params.id as string;
      const userId = req.user!.id;

      const post = twitterStore.posts.find(p => p.id === postId);
      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      if (post.authorId !== userId) {
        res.status(403).json({ error: 'Only the author can delete this post' });
        return;
      }

      // Apply tombstone to preserve reply tree
      post.isDeleted = true;
      post.updatedAt = new Date();

      res.status(200).json({
        message: 'Post deleted (tombstone applied to preserve replies)',
        post: { ...post, text: '[This post has been deleted]' }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async toggleLike(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const postId = req.params.id as string;
      const userId = req.user!.id;

      const post = twitterStore.posts.find(p => p.id === postId);
      if (!post || post.isDeleted) {
        res.status(404).json({ error: 'Post not found or deleted' });
        return;
      }

      const existingIndex = twitterStore.likes.findIndex(
        l => l.postId === postId && l.userId === userId
      );

      if (existingIndex !== -1) {
        twitterStore.likes.splice(existingIndex, 1);
        res.status(200).json({ message: 'Post unliked', liked: false });
      } else {
        const like: TweetLike = {
          id: 'like_' + Math.random().toString(36).substring(2, 9),
          postId,
          userId,
          createdAt: new Date()
        };
        twitterStore.likes.push(like);
        res.status(200).json({ message: 'Post liked', liked: true });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async toggleRepost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const postId = req.params.id as string;
      const userId = req.user!.id;

      const post = twitterStore.posts.find(p => p.id === postId);
      if (!post || post.isDeleted) {
        res.status(404).json({ error: 'Post not found or deleted' });
        return;
      }

      const existingIndex = twitterStore.reposts.findIndex(
        r => r.postId === postId && r.userId === userId
      );

      if (existingIndex !== -1) {
        twitterStore.reposts.splice(existingIndex, 1);
        res.status(200).json({ message: 'Repost removed', reposted: false });
      } else {
        const repost: TweetRepost = {
          id: 'repost_' + Math.random().toString(36).substring(2, 9),
          postId,
          userId,
          createdAt: new Date()
        };
        twitterStore.reposts.push(repost);
        res.status(200).json({ message: 'Reposted successfully', reposted: true });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async quotePost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const targetPostId = req.params.id as string;
      const userId = req.user!.id;
      const { text } = req.body;

      const targetPost = twitterStore.posts.find(p => p.id === targetPostId);
      if (!targetPost || targetPost.isDeleted) {
        res.status(404).json({ error: 'Target post not found or deleted' });
        return;
      }

      const validation = CharacterCounterService.validate(text);
      if (!validation.valid) {
        res.status(400).json({ error: 'Quote text exceeds character limit', details: validation });
        return;
      }

      const quote: TweetQuote = {
        id: 'quote_' + Math.random().toString(36).substring(2, 9),
        userId,
        targetPostId,
        text,
        createdAt: new Date()
      };
      twitterStore.quotes.push(quote);

      res.status(201).json({
        message: 'Quote post created',
        quote
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async getFollowingFeed(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      // Accounts the user follows
      const followingIds = twitterStore.follows
        .filter(f => f.followerId === userId)
        .map(f => f.followingId);

      // Include self
      followingIds.push(userId);

      // Exclude muted & blocked
      const mutedIds = twitterStore.mutes
        .filter(m => m.muterId === userId)
        .map(m => m.mutedId);

      const blockedIds = twitterStore.blocks
        .filter(b => b.blockerId === userId || b.blockedId === userId)
        .map(b => (b.blockerId === userId ? b.blockedId : b.blockerId));

      const excludedIds = new Set([...mutedIds, ...blockedIds]);

      const feedPosts = twitterStore.posts
        .filter(p => followingIds.includes(p.authorId) && !excludedIds.has(p.authorId) && !p.isDeleted)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      res.status(200).json({
        feed: 'following',
        count: feedPosts.length,
        posts: feedPosts
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async getForYouFeed(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const mutedIds = twitterStore.mutes
        .filter(m => m.muterId === userId)
        .map(m => m.mutedId);

      const blockedIds = twitterStore.blocks
        .filter(b => b.blockerId === userId || b.blockedId === userId)
        .map(b => (b.blockerId === userId ? b.blockedId : b.blockerId));

      const excludedIds = new Set([...mutedIds, ...blockedIds]);

      // Score algorithm: likes count * 2 + reposts count * 3 - age penalty
      const scoredPosts = twitterStore.posts
        .filter(p => !excludedIds.has(p.authorId) && !p.isDeleted)
        .map(p => {
          const likes = twitterStore.likes.filter(l => l.postId === p.id).length;
          const reposts = twitterStore.reposts.filter(r => r.postId === p.id).length;
          const ageHours = (Date.now() - p.createdAt.getTime()) / (1000 * 60 * 60);
          const score = (likes * 2 + reposts * 3 + 10) / (ageHours + 2);
          return { post: p, score };
        })
        .sort((a, b) => b.score - a.score)
        .map(sp => sp.post);

      res.status(200).json({
        feed: 'for_you',
        count: scoredPosts.length,
        posts: scoredPosts
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
}
