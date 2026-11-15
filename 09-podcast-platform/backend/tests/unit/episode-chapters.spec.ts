import { ChapterService } from '../../src/services/chapter.service';
import { ChapterItem } from '../../src/types';

describe('ChapterService - Chapter Marker Validation & Chronology', () => {
  let service: ChapterService;

  beforeEach(() => {
    service = new ChapterService();
  });

  it('should sort chapters chronologically by start time', () => {
    const rawChapters: ChapterItem[] = [
      { id: '3', title: 'Chapter Three', startTimeSeconds: 600 },
      { id: '1', title: 'Intro', startTimeSeconds: 0 },
      { id: '2', title: 'Deep Dive', startTimeSeconds: 180 }
    ];

    const result = service.processChapters(rawChapters, 1800);
    expect(result.valid).toBe(true);
    expect(result.chapters[0].title).toBe('Intro');
    expect(result.chapters[1].title).toBe('Deep Dive');
    expect(result.chapters[2].title).toBe('Chapter Three');
  });

  it('should reject chapters with missing titles', () => {
    const rawChapters: ChapterItem[] = [
      { id: '1', title: '', startTimeSeconds: 0 }
    ];

    const result = service.processChapters(rawChapters, 1800);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('missing a title');
  });

  it('should reject chapters with negative start times', () => {
    const rawChapters: ChapterItem[] = [
      { id: '1', title: 'Invalid', startTimeSeconds: -10 }
    ];

    const result = service.processChapters(rawChapters, 1800);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('negative start time');
  });

  it('should reject chapters exceeding episode duration', () => {
    const rawChapters: ChapterItem[] = [
      { id: '1', title: 'Overtime', startTimeSeconds: 2000 }
    ];

    const result = service.processChapters(rawChapters, 1800);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('exceeds episode duration');
  });
});
