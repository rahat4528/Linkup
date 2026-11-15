import { MediaProcessorService } from '../../src/services/media-processor.service';

describe('MediaProcessorService — Validation & Carousel Processing', () => {
  it('processes valid multi-image carousel slides into READY state', () => {
    const rawItems = [
      { url: 'https://images.example.com/slide1.jpg', order: 0 },
      { url: 'https://images.example.com/slide2.png', order: 1 },
      { url: 'https://videos.example.com/clip.mp4', order: 2 },
    ];

    const result = MediaProcessorService.processMedia(rawItems, 'test_post_1');
    expect(result.status).toBe('READY');
    expect(result.media.length).toBe(3);
    expect(result.media[0].type).toBe('IMAGE');
    expect(result.media[2].type).toBe('VIDEO');
    expect(result.media[2].thumbnailUrl).toContain('_thumb.jpg');
  });

  it('fails processing when media list is empty or contains empty URLs', () => {
    const emptyResult = MediaProcessorService.processMedia([], 'test_post_empty');
    expect(emptyResult.status).toBe('FAILED');

    const invalidResult = MediaProcessorService.processMedia([{ url: '   ' }], 'test_post_blank');
    expect(invalidResult.status).toBe('FAILED');
  });

  it('enforces maximum 10 slides per carousel', () => {
    const elevenItems = Array(11).fill({ url: 'https://images.example.com/slide.jpg' });
    expect(() => {
      MediaProcessorService.processMedia(elevenItems, 'test_post_overflow');
    }).toThrow('maximum of 10 media slides');
  });
});
