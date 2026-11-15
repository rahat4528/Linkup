const request = require('supertest');
const jwt = require('jsonwebtoken');
import { app } from '../../src/app';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-podcast-platform-key-change-in-production-2026';

describe('Podcast API & RSS Feed Endpoints', () => {
  const creatorToken = jwt.sign(
    { id: 'user-creator-elena', username: 'tech_voices', role: 'CREATOR' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  it('should list all podcasts', async () => {
    const res = await request(app).get('/api/podcasts');
    expect(res.status).toBe(200);
    expect(res.body.podcasts).toBeInstanceOf(Array);
    expect(res.body.podcasts.length).toBeGreaterThanOrEqual(1);
  });

  it('should get podcast by id or slug', async () => {
    const res = await request(app).get('/api/podcasts/architectures-of-tomorrow');
    expect(res.status).toBe(200);
    expect(res.body.podcast.title).toBe('Architectures of Tomorrow');
  });

  it('should return XML podcast RSS feed', async () => {
    const res = await request(app).get('/api/podcasts/pod-arch-tomorrow/feed.xml');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/xml');
    expect(res.text).toContain('<rss version="2.0"');
    expect(res.text).toContain('<title>Architectures of Tomorrow</title>');
    expect(res.text).toContain('<enclosure');
  });

  it('should create a new podcast show when authenticated', async () => {
    const res = await request(app)
      .post('/api/podcasts')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({
        title: 'Cloud Native Explorations',
        description: 'Kubernetes, Service Meshes, and Cloud Infrastructure.',
        category: 'Technology'
      });

    expect(res.status).toBe(201);
    expect(res.body.podcast.title).toBe('Cloud Native Explorations');
    expect(res.body.podcast.slug).toBe('cloud-native-explorations');
  });

  it('should toggle podcast subscription', async () => {
    const res = await request(app)
      .post('/api/podcasts/pod-arch-tomorrow/subscribe')
      .set('Authorization', `Bearer ${creatorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.isSubscribed).toBeDefined();
  });
});
