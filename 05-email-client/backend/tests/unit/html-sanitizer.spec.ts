import { SanitizerService } from '../../src/services/sanitizer.service';

describe('SanitizerService HTML & Privacy Protection', () => {
  it('should strip script tags and inline event handlers', () => {
    const maliciousHtml = '<p>Hello world!</p><script>alert("xss")</script><img src="x" onerror="stealCookies()">';
    const result = SanitizerService.sanitize(maliciousHtml);

    expect(result.sanitizedHtml).not.toContain('<script>');
    expect(result.sanitizedHtml).not.toContain('alert');
    expect(result.sanitizedHtml).not.toContain('onerror');
    expect(result.sanitizedHtml).toContain('<p>Hello world!</p>');
  });

  it('should block external images and replace with placeholder unless allowed', () => {
    const htmlWithImages = '<p>Newsletter</p><img src="https://tracking.example.com/pixel.gif" alt="tracker">';
    const blockedResult = SanitizerService.sanitize(htmlWithImages, false);

    expect(blockedResult.hasBlockedImages).toBe(true);
    expect(blockedResult.blockedImageCount).toBe(1);
    expect(blockedResult.sanitizedHtml).toContain('data-blocked-src="https://tracking.example.com/pixel.gif"');

    // When allowed:
    const allowedResult = SanitizerService.sanitize(htmlWithImages, true);
    expect(allowedResult.hasBlockedImages).toBe(false);
    expect(allowedResult.sanitizedHtml).toContain('src="https://tracking.example.com/pixel.gif"');
  });

  it('should neutralize javascript: href links', () => {
    const htmlWithJsLink = '<a href="javascript:doBadThings()">Click here</a>';
    const result = SanitizerService.sanitize(htmlWithJsLink);

    expect(result.sanitizedHtml).not.toContain('javascript:doBadThings()');
    expect(result.sanitizedHtml).toContain('href="#"');
  });
});
