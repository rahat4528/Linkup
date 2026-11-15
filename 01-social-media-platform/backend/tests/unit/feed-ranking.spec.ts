import { FeedRankingService } from '../../src/services/feed-ranking.service';
import { memoryStore, StoredPost } from '../../src/services/store.service';

describe('FeedRankingService — Algorithm, Scoring & Fallback', () => {
  const viewerId = 'viewer_1';
  const friendId = 'friend_1';
  const strangerId = 'stranger_1';

  beforeEach(() => {
    memoryStore.clear();

    // Friend relationship
    memoryStore.friendships.push({
      id: 'f1',
      userAId: viewerId,
      userBId: friendId,
      createdAt: new Date(),
    });
  });

  it('assigns higher affinity to friends than strangers', () => {
    const friendAffinity = FeedRankingService.computeAffinity(viewerId, friendId);
    const strangerAffinity = FeedRankingService.computeAffinity(viewerId, strangerId);

    expect(friendAffinity).toBeGreaterThan(strangerAffinity);
    expect(friendAffinity).toBe(1.0);
    expect(strangerAffinity).toBe(0.1);
  });

  it('computes logarithmic engagement score correctly', () => {
    const scoreZero = FeedRankingService.computeEngagement('post_none');
    expect(scoreZero).toBe(0); // ln(1) = 0

    // Add reactions and comments
    memoryStore.reactions.push(
      { id: 'r1', userId: 'u1', postId: 'post_active', type: 'LIKE', createdAt: new Date() },
      { id: 'r2', userId: 'u2', postId: 'post_active', type: 'LOVE', createdAt: new Date() }
    );
    memoryStore.comments.push({
      id: 'c1',
      authorId: 'u3',
      postId: 'post_active',
      content: 'Great update!',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const scoreActive = FeedRankingService.computeEngagement('post_active');
    expect(scoreActive).toBeGreaterThan(0);
    expect(scoreActive).toBeCloseTo(Math.log(1 + 2 * 1.5 + 1 * 3.0), 3);
  });

  it('ranks friend posts with high engagement above older stranger posts', () => {
    const friendPost: StoredPost = {
      id: 'post_friend',
      authorId: friendId,
      content: 'Friend update',
      visibility: 'PUBLIC',
      isEdited: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const strangerPost: StoredPost = {
      id: 'post_stranger',
      authorId: strangerId,
      content: 'Stranger update',
      visibility: 'PUBLIC',
      isEdited: false,
      createdAt: new Date(Date.now() - 48 * 3600 * 1000), // 48h ago
      updatedAt: new Date(),
    };

    memoryStore.posts.push(strangerPost, friendPost);

    const feed = FeedRankingService.getFeed({ viewerId, mode: 'ranked' });
    expect(feed.items.length).toBe(2);
    expect(feed.items[0].id).toBe('post_friend');
    expect(feed.items[1].id).toBe('post_stranger');
  });

  it('supports chronological fallback ordering', () => {
    const olderPost: StoredPost = {
      id: 'post_older',
      authorId: friendId,
      content: 'Older post',
      visibility: 'PUBLIC',
      isEdited: false,
      createdAt: new Date(Date.now() - 10000),
      updatedAt: new Date(),
    };

    const newerPost: StoredPost = {
      id: 'post_newer',
      authorId: strangerId,
      content: 'Newer post',
      visibility: 'PUBLIC',
      isEdited: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryStore.posts.push(olderPost, newerPost);

    const chronoFeed = FeedRankingService.getFeed({ viewerId, mode: 'chronological' });
    expect(chronoFeed.items[0].id).toBe('post_newer');
    expect(chronoFeed.items[1].id).toBe('post_older');
  });
});
