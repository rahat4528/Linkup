const request = require('supertest');
const jwt = require('jsonwebtoken');
import { app } from '../../src/app';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-podcast-platform-key-change-in-production-2026';

describe('Episode Management API', () => {
  const creatorToken = jwt.sign(
    { id: 'user-creator-elena', username: 'tech_voices', role: 'CREATOR' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  it('should list episodes for a podcast', async () => {
    const res = await request(app).get('/api/podcasts/pod-arch-tomorrow/episodes');
    expect(res.status).toBe(200);
    expect(res.body.episodes).toBeInstanceOf(Array);
    expect(res.body.episodes.length).toBeGreaterThanOrEqual(2);
  });

  it('should retrieve a single episode with chapters', async () => {
    const res = await request(app).get('/api/episodes/ep-webrtc-media');
    expect(res.status).toBe(200);
    expect(res.body.episode.title).toContain('WebRTC');
    expect(res.body.episode.chapters.length).toBe(4);
  });

  it('should create a new episode with valid chapter markers', async () => {
    const res = await request(app)
      .post('/api/episodes')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({
        podcastId: 'pod-arch-tomorrow',
        title: 'Episode 3: Zero Trust Service Architectures',
        description: 'Implementing mTLS and identity propagation across microservices.',
        audioUrl: 'https://cdn.example.com/audio/ep3.mp3',
        durationSeconds: 2400.0,
        chapters: [
          { id: '1', title: 'Zero Trust Basics', startTimeSeconds: 0 },
          { id: '2', title: 'mTLS Handshake Mechanics', startTimeSeconds: 600 }
        ]
      });

    expect(res.status).toBe(201);
    expect(res.body.episode.title).toContain('Zero Trust');
    expect(res.body.episode.chapters.length).toBe(2);
  });
});
