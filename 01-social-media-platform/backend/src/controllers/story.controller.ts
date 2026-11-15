import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { memoryStore, StoredStory } from '../services/store.service';
import { VisibilityService } from '../services/visibility.service';
import { FriendshipService } from '../services/friendship.service';

export class StoryController {
  static createStory(req: AuthenticatedRequest, res: Response): void {
    const authorId = req.user!.id;
    const { mediaUrl, caption } = req.body;

    if (!mediaUrl) {
      res.status(400).json({ error: 'Media URL is required for stories' });
      return;
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hour expiry

    const story: StoredStory = {
      id: `story_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      authorId,
      mediaUrl,
      caption,
      createdAt: now,
      expiresAt,
    };
    memoryStore.stories.push(story);

    res.status(201).json({ story });
  }

  static getActiveStories(req: AuthenticatedRequest, res: Response): void {
    const viewerId = req.user!.id;
    const now = new Date();

    const friendIds = new Set(FriendshipService.getFriendIds(viewerId));
    const followedIds = new Set(
      memoryStore.follows.filter((f) => f.followerId === viewerId).map((f) => f.followingId)
    );

    // Filter by expiry and relationship
    const active = memoryStore.stories
      .filter((s) => s.expiresAt.getTime() > now.getTime())
      .filter((s) => {
        if (s.authorId === viewerId) return true;
        if (VisibilityService.isBlocked(viewerId, s.authorId)) return false;
        return friendIds.has(s.authorId) || followedIds.has(s.authorId);
      })
      .map((s) => {
        const author = memoryStore.users.find((u) => u.id === s.authorId);
        return {
          ...s,
          author: author ? { id: author.id, name: author.name, username: author.username } : null,
        };
      });

    res.status(200).json({ stories: active });
  }
}
