import { InstaPost, InstaPostMedia } from './store.service';

export interface RawMediaItem {
  url: string;
  type?: 'IMAGE' | 'VIDEO';
  thumbnailUrl?: string;
  order?: number;
}

export class MediaProcessorService {
  /**
   * Validates and processes a batch of media attachments for a post.
   */
  static processMedia(rawItems: RawMediaItem[], postId: string): { status: 'READY' | 'FAILED'; media: InstaPostMedia[] } {
    if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
      return { status: 'FAILED', media: [] };
    }

    // Enforce carousel limit: max 10 slides
    if (rawItems.length > 10) {
      throw new Error('Carousels are limited to a maximum of 10 media slides');
    }

    const processed: InstaPostMedia[] = [];

    for (let i = 0; i < rawItems.length; i++) {
      const item = rawItems[i];
      if (!item.url || typeof item.url !== 'string' || item.url.trim().length === 0) {
        return { status: 'FAILED', media: [] };
      }

      // Detect spoofed/invalid media extensions
      const lowerUrl = item.url.toLowerCase();
      const isImage = lowerUrl.match(/\.(jpeg|jpg|png|webp|gif)($|\?)/);
      const isVideo = lowerUrl.match(/\.(mp4|webm|mov)($|\?)/);

      const type = item.type || (isVideo ? 'VIDEO' : 'IMAGE');

      processed.push({
        id: `media_${Date.now()}_${i}`,
        postId,
        url: item.url.trim(),
        thumbnailUrl: item.thumbnailUrl || (type === 'VIDEO' ? `${item.url.trim()}_thumb.jpg` : item.url.trim()),
        type,
        order: item.order !== undefined ? item.order : i,
      });
    }

    return {
      status: 'READY',
      media: processed,
    };
  }
}
