const request = require('supertest');
import { app } from '../../src/app';

describe('Track Management & Waveform API', () => {
  it('should list available tracks', async () => {
    const res = await request(app).get('/api/tracks');
    expect(res.status).toBe(200);
    expect(res.body.tracks).toBeInstanceOf(Array);
    expect(res.body.total).toBeGreaterThanOrEqual(2);
  });

  it('should filter tracks by genre', async () => {
    const res = await request(app).get('/api/tracks?genre=Synthwave');
    expect(res.status).toBe(200);
    expect(res.body.tracks.length).toBeGreaterThanOrEqual(1);
    expect(res.body.tracks[0].genre).toBe('Synthwave');
  });

  it('should retrieve a track by ID', async () => {
    const res = await request(app).get('/api/tracks/track-1');
    expect(res.status).toBe(200);
    expect(res.body.track.id).toBe('track-1');
    expect(res.body.track.title).toBe('Neon Horizon');
  });

  it('should retrieve waveform peaks array for a track', async () => {
    const res = await request(app).get('/api/tracks/track-1/waveform');
    expect(res.status).toBe(200);
    expect(res.body.waveform).toBeInstanceOf(Array);
    expect(res.body.waveform.length).toBeGreaterThan(0);
  });

  it('should create a new track with waveform calculation', async () => {
    const sampleBuffer = Buffer.alloc(1024, 64).toString('base64');
    const res = await request(app)
      .post('/api/tracks')
      .send({
        title: 'Quantum Drift',
        artist: 'Sonic Flow',
        genre: 'Ambient',
        durationSeconds: 150.0,
        audioBufferBase64: sampleBuffer
      });

    expect(res.status).toBe(201);
    expect(res.body.track.title).toBe('Quantum Drift');
    expect(res.body.track.waveformData.length).toBe(100);
  });
});
