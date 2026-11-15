import { AudioCacheService } from '../../src/services/cache.service';

describe('AudioCacheService - In-memory chunk buffer cache', () => {
  let cache: AudioCacheService;

  beforeEach(() => {
    cache = new AudioCacheService(60, 3); // TTL 60s, max 3 items
  });

  it('should store and retrieve cached chunks', () => {
    const chunk = Buffer.from('audio-bytes-sample');
    cache.set('track-1', 0, 1024, chunk);

    const retrieved = cache.get('track-1', 0, 1024);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.toString()).toBe('audio-bytes-sample');
  });

  it('should return null for non-cached ranges', () => {
    const retrieved = cache.get('track-1', 1025, 2048);
    expect(retrieved).toBeNull();
  });

  it('should evict oldest item when maxItems limit is reached', () => {
    cache.set('track-1', 0, 100, Buffer.from('chunk1'));
    cache.set('track-1', 101, 200, Buffer.from('chunk2'));
    cache.set('track-1', 201, 300, Buffer.from('chunk3'));
    expect(cache.size()).toBe(3);

    // Insert 4th item, oldest should be evicted
    cache.set('track-1', 301, 400, Buffer.from('chunk4'));
    expect(cache.size()).toBe(3);

    // chunk1 should be evicted
    expect(cache.get('track-1', 0, 100)).toBeNull();
    // chunk4 should exist
    expect(cache.get('track-1', 301, 400)?.toString()).toBe('chunk4');
  });

  it('should clear all entries', () => {
    cache.set('track-1', 0, 100, Buffer.from('chunk1'));
    cache.clear();
    expect(cache.size()).toBe(0);
  });
});
