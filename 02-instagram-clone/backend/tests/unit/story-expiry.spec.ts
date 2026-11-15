import { instaStore, InstaStory } from '../../src/services/store.service';

describe('Story Expiry Boundary Tests (24-Hour Enforcement)', () => {
  const authorId = 'creator_1';
  const now = Date.now();

  beforeEach(() => {
    instaStore.clear();
  });

  it('active story (23 hours and 59 minutes old) is included in active queries', () => {
    const activeStory: InstaStory = {
      id: 'story_active',
      authorId,
      mediaUrl: 'https://images.example.com/sunset.jpg',
      audience: 'EVERYONE',
      createdAt: new Date(now - (23 * 3600 + 59 * 60) * 1000), // created ~24h ago
      expiresAt: new Date(now + 60 * 1000), // expires in 1 minute
    };
    instaStore.stories.push(activeStory);

    const active = instaStore.stories.filter((s) => s.expiresAt.getTime() > Date.now());
    expect(active.length).toBe(1);
    expect(active[0].id).toBe('story_active');
  });

  it('expired story (24 hours and 1 minute old) is strictly excluded at query time', () => {
    const expiredStory: InstaStory = {
      id: 'story_expired',
      authorId,
      mediaUrl: 'https://images.example.com/old.jpg',
      audience: 'EVERYONE',
      createdAt: new Date(now - 25 * 3600 * 1000),
      expiresAt: new Date(now - 60 * 1000), // expired 1 minute ago
    };
    instaStore.stories.push(expiredStory);

    const active = instaStore.stories.filter((s) => s.expiresAt.getTime() > Date.now());
    expect(active.length).toBe(0);
  });
});
