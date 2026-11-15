export interface SanitizeResult {
  sanitizedHtml: string;
  hasBlockedImages: boolean;
  blockedImageCount: number;
}

export class SanitizerService {
  private static readonly SCRIPT_STYLE_BLOCK_REGEX = /<\s*(script|style)[^>]*>[\s\S]*?<\s*\/\s*\1[^>]*>/gi;
  private static readonly DANGEROUS_TAGS_REGEX = /<\s*\/?\s*(script|iframe|object|embed|applet|meta|link|form|input|button|style)[^>]*>/gi;
  private static readonly ON_EVENT_REGEX = /\s+on[a-z]+\s*=\s*(['"][^'"]*['"]|[^\s>]+)/gi;
  private static readonly JAVASCRIPT_HREF_REGEX = /href\s*=\s*['"]\s*javascript:[^'"]*['"]/gi;
  private static readonly EXTERNAL_IMG_REGEX = /<img\s+([^>]*?)src\s*=\s*(['"])(https?:\/\/[^'"]+)\2([^>]*?)>/gi;

  /**
   * Cleans incoming HTML, removes attack vectors, and blocks external images for privacy.
   */
  public static sanitize(html: string, allowExternalImages: boolean = false): SanitizeResult {
    if (!html || html.trim().length === 0) {
      return { sanitizedHtml: '', hasBlockedImages: false, blockedImageCount: 0 };
    }

    let cleaned = html;

    // 1. Remove dangerous script and style blocks entirely (including contents)
    cleaned = cleaned.replace(this.SCRIPT_STYLE_BLOCK_REGEX, '');

    // 2. Remove remaining dangerous tags (iframe, object, embed, etc.)
    cleaned = cleaned.replace(this.DANGEROUS_TAGS_REGEX, '');

    // 3. Remove inline event handlers (onerror, onload, onclick, etc.)
    cleaned = cleaned.replace(this.ON_EVENT_REGEX, '');

    // 4. Remove javascript: protocol links
    cleaned = cleaned.replace(this.JAVASCRIPT_HREF_REGEX, 'href="#"');

    // 5. Handle external images
    let blockedImageCount = 0;
    if (!allowExternalImages) {
      cleaned = cleaned.replace(this.EXTERNAL_IMG_REGEX, (match, before, quote, url, after) => {
        blockedImageCount++;
        return `<img ${before}src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'><rect width='18' height='18' x='3' y='3' rx='2'/><circle cx='9' cy='9' r='2'/><path d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/></svg>" data-blocked-src="${url}" data-original-src="${url}" ${after}>`;
      });
    }

    return {
      sanitizedHtml: cleaned,
      hasBlockedImages: blockedImageCount > 0,
      blockedImageCount
    };
  }
}
