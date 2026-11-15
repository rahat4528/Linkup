import { ChapterItem } from '../types';

export class ChapterService {
  /**
   * Validates and chronologically sorts episode chapter markers
   */
  public processChapters(chapters: ChapterItem[], episodeDuration: number): { valid: boolean; chapters: ChapterItem[]; error?: string } {
    if (!chapters || chapters.length === 0) {
      return { valid: true, chapters: [] };
    }

    // Sort chapters by start time
    const sorted = [...chapters].sort((a, b) => a.startTimeSeconds - b.startTimeSeconds);

    for (let i = 0; i < sorted.length; i++) {
      const ch = sorted[i];

      if (!ch.title || ch.title.trim() === '') {
        return { valid: false, chapters: [], error: `Chapter ${i + 1} is missing a title` };
      }

      if (ch.startTimeSeconds < 0) {
        return { valid: false, chapters: [], error: `Chapter ${i + 1} has negative start time` };
      }

      if (ch.startTimeSeconds >= episodeDuration) {
        return { valid: false, chapters: [], error: `Chapter ${i + 1} start time exceeds episode duration` };
      }

      if (ch.endTimeSeconds !== undefined && ch.endTimeSeconds !== null) {
        if (ch.endTimeSeconds <= ch.startTimeSeconds) {
          return { valid: false, chapters: [], error: `Chapter ${i + 1} end time must be after start time` };
        }
        if (ch.endTimeSeconds > episodeDuration) {
          ch.endTimeSeconds = episodeDuration;
        }
      }
    }

    return { valid: true, chapters: sorted };
  }
}
