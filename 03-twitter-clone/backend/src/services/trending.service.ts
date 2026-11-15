import { twitterStore } from './store.service';

export interface TrendingTopic {
  tag: string;
  count: number;
  category?: string;
}

export class TrendingService {
  private static readonly HASHTAG_REGEX = /#([\w\u0080-\uFFFF]+)/g;

  /**
   * Computes trending hashtags over posts from the last 24 hours.
   */
  public static getTrendingTopics(limit: number = 10): TrendingTopic[] {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentPosts = twitterStore.posts.filter(p => !p.isDeleted && p.createdAt >= cutoff);

    const counts = new Map<string, number>();

    for (const post of recentPosts) {
      const matches = post.text.match(this.HASHTAG_REGEX);
      if (matches) {
        for (const match of matches) {
          const tag = match.toLowerCase();
          counts.set(tag, (counts.get(tag) || 0) + 1);
        }
      }
    }

    const sorted = Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    return sorted.slice(0, limit);
  }
}
