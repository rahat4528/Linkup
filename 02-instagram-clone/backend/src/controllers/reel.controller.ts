import { Response } from 'express';
import { AuthenticatedInstaRequest } from '../middleware/auth.middleware';
import { instaStore, InstaReel } from '../services/store.service';
import { HashtagService } from '../services/hashtag.service';

export class ReelController {
  static createReel(req: AuthenticatedInstaRequest, res: Response): void {
    const authorId = req.user!.id;
    const { videoUrl, caption, audioTrack = 'Original Audio' } = req.body;

    if (!videoUrl) {
      res.status(400).json({ error: 'Video URL is required for reels' });
      return;
    }

    const tags = HashtagService.extractHashtags(caption || '');
    HashtagService.registerHashtags(tags);

    const reel: InstaReel = {
      id: `reel_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      authorId,
      videoUrl,
      caption: caption || '',
      audioTrack,
      viewsCount: 0,
      likesCount: 0,
      createdAt: new Date(),
    };
    instaStore.reels.unshift(reel);

    res.status(201).json({ reel, tags });
  }

  static getReelsFeed(req: AuthenticatedInstaRequest, res: Response): void {
    const list = instaStore.reels.map((r) => {
      const author = instaStore.users.find((u) => u.id === r.authorId);
      const profile = instaStore.profiles.find((p) => p.userId === r.authorId);
      return {
        ...r,
        author: {
          id: author?.id,
          username: author?.username,
          avatarUrl: profile?.avatarUrl,
        },
      };
    });

    res.status(200).json({ reels: list });
  }
}
