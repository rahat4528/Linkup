import { StreamingService } from '../../src/services/streaming.service';

describe('StreamingService - HTTP Range Parsing', () => {
  let service: StreamingService;
  const mockFileSize = 1000000; // 1,000,000 bytes (~1MB)

  beforeEach(() => {
    service = new StreamingService(262144); // 256KB max chunk size for test
  });

  it('should parse a standard range request: bytes=0-1023', () => {
    const range = service.parseRange('bytes=0-1023', mockFileSize);
    expect(range.isValid).toBe(true);
    expect(range.start).toBe(0);
    expect(range.end).toBe(1023);
    expect(range.chunkSize).toBe(1024);
    expect(range.contentRange).toBe('bytes 0-1023/1000000');
  });

  it('should parse an open-ended range request: bytes=500000-', () => {
    const range = service.parseRange('bytes=500000-', mockFileSize);
    expect(range.isValid).toBe(true);
    expect(range.start).toBe(500000);
    // Should be clamped by defaultChunkSize (256KB)
    expect(range.end).toBe(500000 + 262144 - 1);
    expect(range.chunkSize).toBe(262144);
    expect(range.contentRange).toBe(`bytes 500000-${500000 + 262144 - 1}/1000000`);
  });

  it('should parse a suffix range request: bytes=-500 (last 500 bytes)', () => {
    const range = service.parseRange('bytes=-500', mockFileSize);
    expect(range.isValid).toBe(true);
    expect(range.start).toBe(999500);
    expect(range.end).toBe(999999);
    expect(range.chunkSize).toBe(500);
    expect(range.contentRange).toBe('bytes 999500-999999/1000000');
  });

  it('should reject invalid range with start > totalSize', () => {
    const range = service.parseRange('bytes=2000000-2500000', mockFileSize);
    expect(range.isValid).toBe(false);
    expect(range.start).toBe(-1);
    expect(range.contentRange).toBe('bytes */1000000');
  });

  it('should reject invalid range with start > end', () => {
    const range = service.parseRange('bytes=500-200', mockFileSize);
    expect(range.isValid).toBe(false);
    expect(range.contentRange).toBe('bytes */1000000');
  });

  it('should handle undefined range header with default initial chunk', () => {
    const range = service.parseRange(undefined, mockFileSize);
    expect(range.isValid).toBe(true);
    expect(range.start).toBe(0);
    expect(range.end).toBe(262143);
    expect(range.chunkSize).toBe(262144);
  });
});
