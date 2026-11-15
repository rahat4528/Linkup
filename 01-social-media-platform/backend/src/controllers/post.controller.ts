import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { memoryStore, StoredPost, StoredReaction, StoredComment } from '../services/store.service';
import { VisibilityService } from '../services/visibility.service';
import { FeedRankingService } from '../services/feed-ranking.service';
import { SocketService } from '../services/socket.service';

export class PostController {
  static createPost(req: AuthenticatedRequest, res: Response): void {
    const authorId = req.user!.id;
    const { content, visibility = 'PUBLIC', groupId } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({ error: 'Post content cannot be empty' });
      return;
    }

    if (groupId) {
      const group = memoryStore.groups.find((g) => g.id === groupId);
      if (!group) {
        res.status(404).json({ error: 'Group not found' });
        return;
      }
      if (!VisibilityService.isGroupMember(authorId, groupId)) {
        res.status(403).json({ error: 'Must be a member of the group to publish' });
        return;
      }
    }

    const newPost: StoredPost = {
      id: `post_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      authorId,
      content: content.trim(),
      visibility,
      groupId: groupId || null,
      isEdited: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.posts.unshift(newPost);

    if (groupId) {
      SocketService.broadcastGroupPost(groupId, newPost);
    }

    res.status(201).json({ post: newPost });
  }

  static getFeed(req: AuthenticatedRequest, res: Response): void {
    const viewerId = req.user!.id;
    const { cursor, limit, mode } = req.query;

    const feedResult = FeedRankingService.getFeed({
      viewerId,
      cursor: cursor as string,
      limit: limit ? parseInt(limit as string, 10) : 20,
      mode: (mode as 'ranked' | 'chronological') || 'ranked',
    });

    // Hydrate author details and reaction counts
    const enriched = feedResult.items.map((p) => {
      const author = memoryStore.users.find((u) => u.id === p.authorId);
      const reactions = memoryStore.reactions.filter((r) => r.postId === p.id);
      const userReaction = reactions.find((r) => r.userId === viewerId)?.type || null;
      const commentsCount = memoryStore.comments.filter((c) => c.postId === p.id).length;

      return {
        ...p,
        author: author ? { id: author.id, name: author.name, username: author.username } : null,
        reactionsCount: reactions.length,
        userReaction,
        commentsCount,
      };
    });

    res.status(200).json({
      items: enriched,
      nextCursor: feedResult.nextCursor,
      hasMore: feedResult.hasMore,
    });
  }

  static getPostById(req: AuthenticatedRequest, res: Response): void {
    const viewerId = req.user ? req.user.id : null;
    const postId = req.params.id as string;

    const post = memoryStore.posts.find((p) => p.id === postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    if (!VisibilityService.canViewPost(viewerId, post)) {
      res.status(403).json({ error: 'Unauthorized to view this post' });
      return;
    }

    const author = memoryStore.users.find((u) => u.id === post.authorId);
    const reactions = memoryStore.reactions.filter((r) => r.postId === post.id);
    const comments = memoryStore.comments.filter((c) => c.postId === post.id);

    res.status(200).json({
      post: {
        ...post,
        author: author ? { id: author.id, name: author.name, username: author.username } : null,
        reactionsCount: reactions.length,
        comments,
      },
    });
  }

  static updatePost(req: AuthenticatedRequest, res: Response): void {
    const userId = req.user!.id;
    const postId = req.params.id as string;
    const { content } = req.body;

    const post = memoryStore.posts.find((p) => p.id === postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    if (post.authorId !== userId) {
      res.status(403).json({ error: 'Only the author can edit this post' });
      return;
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({ error: 'Content cannot be empty' });
      return;
    }

    post.content = content.trim();
    post.isEdited = true;
    post.updatedAt = new Date();

    res.status(200).json({ post });
  }

  static deletePost(req: AuthenticatedRequest, res: Response): void {
    const user = req.user!;
    const postId = req.params.id as string;

    const postIndex = memoryStore.posts.findIndex((p) => p.id === postId);
    if (postIndex === -1) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const post = memoryStore.posts[postIndex];
    if (post.authorId !== user.id && user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Unauthorized to delete this post' });
      return;
    }

    memoryStore.posts.splice(postIndex, 1);
    memoryStore.reactions = memoryStore.reactions.filter((r) => r.postId !== postId);
    memoryStore.comments = memoryStore.comments.filter((c) => c.postId !== postId);

    res.status(200).json({ message: 'Post deleted successfully' });
  }

  /**
   * Idempotent reaction upsert. One reaction per user per post.
   */
  static reactToPost(req: AuthenticatedRequest, res: Response): void {
    const userId = req.user!.id;
    const postId = req.params.id as string;
    const { type = 'LIKE' } = req.body;

    const post = memoryStore.posts.find((p) => p.id === postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    if (!VisibilityService.canViewPost(userId, post)) {
      res.status(403).json({ error: 'Unauthorized to react to this post' });
      return;
    }

    let existing = memoryStore.reactions.find((r) => r.postId === postId && r.userId === userId);
    if (existing) {
      existing.type = type;
    } else {
      const newReaction: StoredReaction = {
        id: `react_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        userId,
        postId,
        type,
        createdAt: new Date(),
      };
      memoryStore.reactions.push(newReaction);
    }

    if (post.authorId !== userId) {
      SocketService.sendNotification({
        id: `notif_${Date.now()}`,
        userId: post.authorId,
        actorId: userId,
        type: 'REACTION',
        title: 'New Reaction',
        message: `${req.user!.name} reacted to your post.`,
        isRead: false,
        createdAt: new Date(),
      });
    }

    const totalReactions = memoryStore.reactions.filter((r) => r.postId === postId).length;
    res.status(200).json({ message: 'Reaction recorded', totalReactions, userReaction: type });
  }

  static removeReaction(req: AuthenticatedRequest, res: Response): void {
    const userId = req.user!.id;
    const postId = req.params.id as string;

    memoryStore.reactions = memoryStore.reactions.filter(
      (r) => !(r.postId === postId && r.userId === userId)
    );

    const totalReactions = memoryStore.reactions.filter((r) => r.postId === postId).length;
    res.status(200).json({ message: 'Reaction removed', totalReactions });
  }

  static addComment(req: AuthenticatedRequest, res: Response): void {
    const authorId = req.user!.id;
    const postId = req.params.id as string;
    const { content, parentId } = req.body;

    const post = memoryStore.posts.find((p) => p.id === postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    if (!VisibilityService.canViewPost(authorId, post)) {
      res.status(403).json({ error: 'Unauthorized to comment on this post' });
      return;
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({ error: 'Comment content cannot be empty' });
      return;
    }

    const newComment: StoredComment = {
      id: `comm_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      authorId,
      postId,
      parentId: parentId || null,
      content: content.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.comments.push(newComment);

    if (post.authorId !== authorId) {
      SocketService.sendNotification({
        id: `notif_${Date.now()}`,
        userId: post.authorId,
        actorId: authorId,
        type: 'COMMENT',
        title: 'New Comment',
        message: `${req.user!.name} commented on your post.`,
        isRead: false,
        createdAt: new Date(),
      });
    }

    res.status(201).json({ comment: newComment });
  }
}
