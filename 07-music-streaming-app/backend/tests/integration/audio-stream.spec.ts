const request = require('supertest');
import { app } from '../../src/app';

describe('Audio Streaming API - HTTP Range Requests', () => {
  it('should stream audio with 206 Partial Content when Range header is provided', async () => {
    const res = await request(app)
      .get('/api/stream/track-1')
      .set('Range', 'bytes=0-1023');

    expect(res.status).toBe(206);
    expect(res.headers['content-range']).toBe('bytes 0-1023/1048576');
    expect(res.headers['accept-ranges']).toBe('bytes');
    expect(res.headers['content-length']).toBe('1024');
    expect(res.headers['content-type']).toContain('audio/mpeg');
    expect(res.body).toBeInstanceOf(Buffer);
    expect(res.body.length).toBe(1024);
  });

  it('should support mid-file range seeking', async () => {
    const res = await request(app)
      .get('/api/stream/track-1')
      .set('Range', 'bytes=5000-9999');

    expect(res.status).toBe(206);
    expect(res.headers['content-range']).toBe('bytes 5000-9999/1048576');
    expect(res.headers['content-length']).toBe('5000');
    expect(res.body.length).toBe(5000);
  });

  it('should return 416 Range Not Satisfiable when range is outside file size', async () => {
    const res = await request(app)
      .get('/api/stream/track-1')
      .set('Range', 'bytes=2000000-3000000');

    expect(res.status).toBe(416);
    expect(res.headers['content-range']).toBe('bytes */1048576');
  });

  it('should return 404 when streaming non-existent track', async () => {
    const res = await request(app)
      .get('/api/stream/non-existent-track')
      .set('Range', 'bytes=0-100');

    expect(res.status).toBe(404);
  });

  it('should provide stream statistics and protocol support info', async () => {
    const res = await request(app).get('/api/stream-stats');
    expect(res.status).toBe(200);
    expect(res.body.streamingProtocol).toContain('HTTP/1.1 Range Requests');
    expect(res.body.supportedCodecs).toBeInstanceOf(Array);
  });
});
