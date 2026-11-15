import { memoryStore, StoredPost } from './store.service';
import { VisibilityService } from './visibility.service';
import { FriendshipService } from './friendship.service';

export interface FeedQueryOptions {
  viewerId: string;
  limit?: number;
  cursor?: string;
  mode?: 'ranked' | 'chronological';
}

export interface FeedResult {
  items: Array<StoredPost & { score?: number }>;
  nextCursor: string | null;
  hasMore: boolean;
}

export class FeedRankingService {
  /**
   * Computes relationship affinity score between viewer and post author.
   */
  static computeAffinity(viewerId: string, authorId: string, groupId?: string | null): number {
    if (viewerId === authorId) return 1.0;
    if (VisibilityService.areFriends(viewerId, authorId)) return 1.0;

    const isFollowing = memoryStore.follows.some(
      (f) => f.followerId === viewerId && f.followingId === authorId
    );
    if (isFollowing) return 0.6;

    if (groupId && VisibilityService.isGroupMember(viewerId, groupId)) {
      return 0.5;
    }

    return 0.1;
  }

  /**
   * Computes engagement score using logarithmic weighting.
   */
  static computeEngagement(postId: string): number {
    const reactionCount = memoryStore.reactions.filter((r) => r.postId === postId).length;
    const commentCount = memoryStore.comments.filter((c) => c.postId === postId).length;
    return Math.log(1 + reactionCount * 1.5 + commentCount * 3.0);
  }

  /**
   * Computes time decay (half-life of 24 hours).
   */
  static computeRecency(createdAt: Date): number {
    const hoursElapsed = Math.max(0, (Date.now() - createdAt.getTime()) / (1000 * 60 * 60));
    const lambda = Math.log(2) / 24;
    return Math.exp(-lambda * hoursElapsed);
  }

  /**
   * Calculates overall ranking score for a post.
   */
  static scorePost(viewerId: string, post: StoredPost): number {
    const affinity = this.computeAffinity(viewerId, post.authorId, post.groupId);
    const engagement = this.computeEngagement(post.id);
    const recency = this.computeRecency(post.createdAt);

    return Number((affinity * 0.4 + engagement * 0.35 + recency * 0.25).toFixed(4));
  }

  /**
   * Generates ranked or chronological feed with cursor pagination.
   */
  static getFeed(options: FeedQueryOptions): FeedResult {
    const { viewerId, limit = 20, cursor, mode = 'ranked' } = options;

    // 1. Filter posts by visibility matrix and blocking rules
    const visiblePosts = memoryStore.posts.filter((post) =>
      VisibilityService.canViewPost(viewerId, post)
    );

    // 2. Score and sort
    let scoredPosts: Array<StoredPost & { score?: number }> = [];

    if (mode === 'chronological') {
      scoredPosts = [...visiblePosts].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
    } else {
      scoredPosts = visiblePosts
        .map((p) => ({
          ...p,
          score: this.scorePost(viewerId, p),
        }))
        .sort((a, b) => {
          if (b.score !== a.score) {
            return (b.score || 0) - (a.score || 0);
          }
          return b.createdAt.getTime() - a.createdAt.getTime();
        });
    }

    // 3. Apply cursor pagination
    let startIndex = 0;
    if (cursor) {
      try {
        const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
        const [cursorId] = decoded.split(':');
        const foundIndex = scoredPosts.findIndex((p) => p.id === cursorId);
        if (foundIndex !== -1) {
          startIndex = foundIndex + 1;
        }
      } catch {
        startIndex = 0;
      }
    }

    const pageItems = scoredPosts.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < scoredPosts.length;
    let nextCursor: string | null = null;

    if (hasMore && pageItems.length > 0) {
      const lastItem = pageItems[pageItems.length - 1];
      nextCursor = Buffer.from(`${lastItem.id}:${lastItem.createdAt.getTime()}`).toString('base64');
    }

    return {
      items: pageItems,
      nextCursor,
      hasMore,
    };
  }
}
