const request = require('supertest');
import { createApp } from '../../src/app';
import { instaStore } from '../../src/services/store.service';

const app = createApp();

describe('Reels & Explore Integration Tests', () => {
  let userToken: string;

  beforeEach(async () => {
    instaStore.clear();

    const reg = await request(app).post('/api/v1/auth/register').send({
      email: 'creator2@example.com',
      username: 'reelcreator',
      password: 'Password123!',
      name: 'Reel Creator',
    });
    userToken = reg.body.token;
  });

  it('publishes vertical reel video and retrieves from reels stream', async () => {
    const reelRes = await request(app)
      .post('/api/v1/reels')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        videoUrl: 'https://videos.example.com/dance-reel.mp4',
        caption: 'Morning choreography #dance #music',
        audioTrack: 'Original Viral Track',
      });

    expect(reelRes.status).toBe(201);
    expect(reelRes.body.reel.audioTrack).toBe('Original Viral Track');

    const feedRes = await request(app).get('/api/v1/reels/feed');
    expect(feedRes.status).toBe(200);
    expect(feedRes.body.reels.length).toBe(1);
    expect(feedRes.body.reels[0].caption).toContain('#dance');
  });

  it('serves explore grid and filters posts by hashtag', async () => {
    // Publish post with hashtag
    await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        caption: 'Wanderlust exploration #travel',
        media: [{ url: 'https://images.example.com/mountain.jpg' }],
      });

    // 1. Explore grid
    const exploreRes = await request(app).get('/api/v1/explore');
    expect(exploreRes.status).toBe(200);
    expect(exploreRes.body.explore.length).toBe(1);

    // 2. Hashtag search
    const tagRes = await request(app).get('/api/v1/tags/travel');
    expect(tagRes.status).toBe(200);
    expect(tagRes.body.posts.length).toBe(1);
    expect(tagRes.body.posts[0].caption).toContain('#travel');
  });
});
