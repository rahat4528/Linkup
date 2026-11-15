import { instaStore, InstaHashtag } from './store.service';

export class HashtagService {
  /**
   * Extracts and normalizes hashtags from caption text.
   */
  static extractHashtags(caption: string): string[] {
    if (!caption) return [];
    const regex = /#([a-zA-Z0-9_\u00c0-\u024f]+)/gi;
    const matches = caption.match(regex);
    if (!matches) return [];

    const normalized = new Set<string>();
    for (const match of matches) {
      const cleanTag = match.replace('#', '').toLowerCase().trim();
      if (cleanTag.length > 0) {
        normalized.add(cleanTag);
      }
    }
    return Array.from(normalized);
  }

  /**
   * Registers hashtag occurrences and updates usage volume.
   */
  static registerHashtags(tags: string[]): void {
    const now = new Date();
    for (const tag of tags) {
      const existing = instaStore.hashtags.find((h) => h.tag === tag);
      if (existing) {
        existing.postsCount += 1;
        existing.lastUsedAt = now;
      } else {
        const newTag: InstaHashtag = {
          id: `tag_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          tag,
          postsCount: 1,
          lastUsedAt: now,
        };
        instaStore.hashtags.push(newTag);
      }
    }
  }

  /**
   * Retrieves trending hashtags computed over a sliding time window (default 24h).
   */
  static getTrending(limit = 10, windowHours = 24): InstaHashtag[] {
    const cutoff = new Date(Date.now() - windowHours * 60 * 60 * 1000);
    return instaStore.hashtags
      .filter((h) => h.lastUsedAt.getTime() >= cutoff.getTime())
      .sort((a, b) => b.postsCount - a.postsCount)
      .slice(0, limit);
  }
}
