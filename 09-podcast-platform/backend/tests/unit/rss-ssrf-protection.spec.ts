import { RssParserService } from '../../src/services/rss-parser.service';

describe('RssParserService - SSRF Protection on External Feeds', () => {
  let service: RssParserService;

  beforeEach(() => {
    service = new RssParserService();
  });

  it('should block localhost addresses', () => {
    const res = service.isSafeUrl('http://localhost:8080/feed.xml');
    expect(res.isSafe).toBe(false);
    expect(res.reason).toContain('internal hostnames');
  });

  it('should block loopback 127.0.0.1', () => {
    const res = service.isSafeUrl('http://127.0.0.1/podcast.rss');
    expect(res.isSafe).toBe(false);
    expect(res.reason).toContain('private or link-local');
  });

  it('should block cloud metadata endpoint 169.254.169.254', () => {
    const res = service.isSafeUrl('http://169.254.169.254/latest/meta-data/');
    expect(res.isSafe).toBe(false);
    expect(res.reason).toContain('private or link-local');
  });

  it('should block private subnet 10.0.0.0/8', () => {
    const res = service.isSafeUrl('http://10.10.2.14/internal-feed');
    expect(res.isSafe).toBe(false);
  });

  it('should block private subnet 192.168.0.0/16', () => {
    const res = service.isSafeUrl('http://192.168.1.50:3000/feed');
    expect(res.isSafe).toBe(false);
  });

  it('should block non-HTTP protocols (e.g. file://, ftp://)', () => {
    const res = service.isSafeUrl('file:///etc/passwd');
    expect(res.isSafe).toBe(false);
    expect(res.reason).toContain('Invalid protocol');
  });

  it('should allow valid public HTTPS podcast feeds', () => {
    const res = service.isSafeUrl('https://feeds.buzzsprout.com/1234567.rss');
    expect(res.isSafe).toBe(true);
  });
});
