export class AudioCacheService {
  private memoryCache: Map<string, { buffer: Buffer; expiresAt: number }>;
  private defaultTtlMs: number;
  private maxItems: number;

  constructor(defaultTtlSeconds: number = 3600, maxItems: number = 500) {
    this.memoryCache = new Map();
    this.defaultTtlMs = defaultTtlSeconds * 1000;
    this.maxItems = maxItems;
  }

  private buildKey(trackId: string, start: number, end: number): string {
    return `${trackId}:${start}-${end}`;
  }

  public get(trackId: string, start: number, end: number): Buffer | null {
    const key = this.buildKey(trackId, start, end);
    const item = this.memoryCache.get(key);

    if (!item) {
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    return item.buffer;
  }

  public set(trackId: string, start: number, end: number, buffer: Buffer, ttlSeconds?: number): void {
    // Evict oldest if limit reached
    if (this.memoryCache.size >= this.maxItems) {
      const firstKey = this.memoryCache.keys().next().value;
      if (firstKey) {
        this.memoryCache.delete(firstKey);
      }
    }

    const key = this.buildKey(trackId, start, end);
    const ttlMs = ttlSeconds ? ttlSeconds * 1000 : this.defaultTtlMs;
    this.memoryCache.set(key, {
      buffer,
      expiresAt: Date.now() + ttlMs
    });
  }

  public clear(): void {
    this.memoryCache.clear();
  }

  public size(): number {
    return this.memoryCache.size;
  }
}
