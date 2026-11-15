import { HashtagService } from '../../src/services/hashtag.service';
import { instaStore } from '../../src/services/store.service';

describe('HashtagService — Extraction, Normalization & Trending', () => {
  beforeEach(() => {
    instaStore.clear();
  });

  it('extracts, normalizes to lowercase, and deduplicates hashtags from caption', () => {
    const caption = 'Sunset vibes at #LakeComo! Loving #Travel, #sunset and #TRAVEL again #wanderlust_2026.';
    const tags = HashtagService.extractHashtags(caption);

    expect(tags).toContain('lakecomo');
    expect(tags).toContain('travel');
    expect(tags).toContain('sunset');
    expect(tags).toContain('wanderlust_2026');
    expect(tags.filter((t) => t === 'travel').length).toBe(1); // deduplicated
  });

  it('tracks hashtag frequency and computes trending hashtags', () => {
    HashtagService.registerHashtags(['travel', 'photography']);
    HashtagService.registerHashtags(['travel', 'nature']);
    HashtagService.registerHashtags(['travel']);

    const trending = HashtagService.getTrending(5);
    expect(trending.length).toBe(3);
    expect(trending[0].tag).toBe('travel');
    expect(trending[0].postsCount).toBe(3);
  });
});
