import { URL } from 'url';

export class RssParserService {
  /**
   * Validates if a feed URL is safe from SSRF attacks
   */
  public isSafeUrl(feedUrl: string): { isSafe: boolean; reason?: string } {
    try {
      const parsed = new URL(feedUrl);

      // 1. Only allow HTTP and HTTPS
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return { isSafe: false, reason: 'Invalid protocol: only HTTP and HTTPS are permitted' };
      }

      const hostname = parsed.hostname.toLowerCase();

      // 2. Reject localhost and local domains
      if (
        hostname === 'localhost' ||
        hostname.endsWith('.localhost') ||
        hostname.endsWith('.local') ||
        hostname.endsWith('.internal')
      ) {
        return { isSafe: false, reason: 'Access to internal hostnames is prohibited' };
      }

      // 3. Reject private IPv4 ranges & cloud metadata IP
      if (this.isPrivateOrReservedIp(hostname)) {
        return { isSafe: false, reason: 'Access to private or link-local IP addresses is prohibited' };
      }

      return { isSafe: true };
    } catch {
      return { isSafe: false, reason: 'Malformed URL' };
    }
  }

  /**
   * Detects private, loopback, or cloud metadata IP ranges
   */
  public isPrivateOrReservedIp(ip: string): boolean {
    // Exact matches
    if (ip === '127.0.0.1' || ip === '0.0.0.0' || ip === '::1' || ip === '169.254.169.254') {
      return true;
    }

    // IPv4 pattern check
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = ip.match(ipv4Regex);
    if (match) {
      const [_, o1, o2, o3, o4] = match.map(Number);

      // Loopback 127.0.0.0/8
      if (o1 === 127) return true;

      // 10.0.0.0/8
      if (o1 === 10) return true;

      // 172.16.0.0/12 (172.16.0.0 to 172.31.255.255)
      if (o1 === 172 && o2 >= 16 && o2 <= 31) return true;

      // 192.168.0.0/16
      if (o1 === 192 && o2 === 168) return true;

      // 169.254.0.0/16 (Link-local / Cloud metadata)
      if (o1 === 169 && o2 === 254) return true;

      // 0.0.0.0/8
      if (o1 === 0) return true;
    }

    return false;
  }
}
