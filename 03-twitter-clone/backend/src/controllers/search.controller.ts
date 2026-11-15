import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { twitterStore } from '../services/store.service';
import { TrendingService } from '../services/trending.service';
import { SafetyService } from '../services/safety.service';

export class SearchController {
  public static async search(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const q = ((req.query.q as string) || '').trim().toLowerCase();
      const currentUserId = req.user?.id;

      if (!q) {
        res.status(200).json({ posts: [], users: [] });
        return;
      }

      // Search matching users
      const users = twitterStore.users
        .filter(u => {
          if (currentUserId && SafetyService.isBlockedBetween(currentUserId, u.id)) return false;
          return u.username.toLowerCase().includes(q) || u.name.toLowerCase().includes(q);
        })
        .map(u => ({ id: u.id, username: u.username, name: u.name }));

      // Search matching posts
      const posts = twitterStore.posts
        .filter(p => {
          if (p.isDeleted) return false;
          if (currentUserId && SafetyService.isBlockedBetween(currentUserId, p.authorId)) return false;
          return p.text.toLowerCase().includes(q);
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      res.status(200).json({
        query: q,
        users,
        posts
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async getTrending(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const topics = TrendingService.getTrendingTopics(10);
      res.status(200).json({
        trending: topics
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
}
