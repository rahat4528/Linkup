import { Response } from 'express';
import { AuthenticatedInstaRequest } from '../middleware/auth.middleware';
import { instaStore, InstaStory, InstaStoryView } from '../services/store.service';
import { PrivacyService } from '../services/privacy.service';

export class StoryController {
  static createStory(req: AuthenticatedInstaRequest, res: Response): void {
    const authorId = req.user!.id;
    const { mediaUrl, caption, audience = 'EVERYONE' } = req.body;

    if (!mediaUrl) {
      res.status(400).json({ error: 'Media URL is required' });
      return;
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // exactly 24 hours

    const story: InstaStory = {
      id: `story_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      authorId,
      mediaUrl,
      caption,
      audience,
      createdAt: now,
      expiresAt,
    };
    instaStore.stories.push(story);

    res.status(201).json({ story });
  }

  static getActiveStories(req: AuthenticatedInstaRequest, res: Response): void {
    const viewerId = req.user!.id;
    const now = new Date();

    const followedIds = new Set(
      instaStore.follows.filter((f) => f.followerId === viewerId).map((f) => f.followingId)
    );
    followedIds.add(viewerId);

    // Strictly enforce expiresAt > now() at query time
    const activeStories = instaStore.stories
      .filter((s) => s.expiresAt.getTime() > now.getTime())
      .filter((s) => followedIds.has(s.authorId) && !PrivacyService.isBlocked(viewerId, s.authorId))
      .map((s) => {
        const author = instaStore.users.find((u) => u.id === s.authorId);
        const profile = instaStore.profiles.find((p) => p.userId === s.authorId);
        const viewsCount = instaStore.storyViews.filter((v) => v.storyId === s.id).length;
        const hasViewed = instaStore.storyViews.some((v) => v.storyId === s.id && v.viewerId === viewerId);

        return {
          id: s.id,
          mediaUrl: s.mediaUrl,
          caption: s.caption,
          createdAt: s.createdAt,
          expiresAt: s.expiresAt,
          author: {
            id: author?.id,
            username: author?.username,
            avatarUrl: profile?.avatarUrl,
          },
          viewsCount,
          hasViewed,
        };
      });

    res.status(200).json({ stories: activeStories });
  }

  static recordStoryView(req: AuthenticatedInstaRequest, res: Response): void {
    const viewerId = req.user!.id;
    const storyId = req.params.id as string;

    const story = instaStore.stories.find(
      (s) => s.id === storyId && s.expiresAt.getTime() > Date.now()
    );
    if (!story) {
      res.status(404).json({ error: 'Story not found or expired' });
      return;
    }

    const existingView = instaStore.storyViews.find(
      (v) => v.storyId === storyId && v.viewerId === viewerId
    );
    if (!existingView) {
      instaStore.storyViews.push({
        id: `view_${Date.now()}`,
        storyId,
        viewerId,
        viewedAt: new Date(),
      });
    }

    res.status(200).json({ message: 'View recorded' });
  }
}
