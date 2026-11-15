// Character Counter Service adhering to 280-char microblogging rules:
// 1. URLs (http/https) are treated as 23 characters regardless of raw length.
// 2. Grapheme clusters (emojis, complex joined glyphs) count as 1 character.

export class CharacterCounterService {
  private static readonly URL_REGEX = /https?:\/\/[^\s]+/gi;
  private static readonly URL_WEIGHT = 23;
  private static readonly MAX_CHARS = 280;

  /**
   * Calculates the weighted length of a post according to Unicode graphemes and 23-char URLs.
   */
  public static calculateLength(text: string): number {
    if (!text || text.length === 0) return 0;

    // Step 1: Replace all URLs with a placeholder of exactly 23 characters
    let urlReplaced = text.replace(this.URL_REGEX, () => 'X'.repeat(this.URL_WEIGHT));

    // Step 2: Count grapheme clusters
    if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
      const segmenter = new (Intl as any).Segmenter('en', { granularity: 'grapheme' });
      const segments = Array.from(segmenter.segment(urlReplaced));
      return segments.length;
    }

    // Fallback for environments without Intl.Segmenter: array spreading handles surrogate pairs
    return Array.from(urlReplaced).length;
  }

  /**
   * Validates if the text fits within the 280-character budget.
   */
  public static validate(text: string): { valid: boolean; length: number; remaining: number } {
    const length = this.calculateLength(text);
    const remaining = this.MAX_CHARS - length;
    return {
      valid: length > 0 && length <= this.MAX_CHARS,
      length,
      remaining
    };
  }
}
