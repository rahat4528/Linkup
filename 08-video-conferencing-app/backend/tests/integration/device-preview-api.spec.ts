const request = require('supertest');
import { app } from '../../src/app';

describe('Device Preview & Audio Meter API', () => {
  it('should test audio samples and return VU metrics', async () => {
    const res = await request(app)
      .post('/api/devices/test-audio')
      .send({ samples: [20, 45, 60, 30] });

    expect(res.status).toBe(200);
    expect(res.body.averageLevel).toBeDefined();
    expect(res.body.peakLevel).toBe(60);
    expect(res.body.isClipping).toBe(false);
  });

  it('should handle empty sample payload gracefully', async () => {
    const res = await request(app)
      .post('/api/devices/test-audio')
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.averageLevel).toBe(0);
    expect(res.body.peakLevel).toBe(0);
  });
});
