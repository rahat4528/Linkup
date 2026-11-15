const request = require('supertest');
import { createApp } from '../../src/app';
import { twitterStore } from '../../src/services/store.service';

describe('Search and Trending Topics API', () => {
  let app: any;
  let userToken: string;

  beforeAll(async () => {
    app = createApp();
  });

  beforeEach(async () => {
    twitterStore.clear();

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'trendsetter@microblog.com',
        username: 'trendsetter',
        password: 'password123',
        name: 'Trend Setter'
      });
    userToken = res.body.token;
  });

  it('should compute trending topics from recent hashtags', async () => {
    await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ text: 'Exciting news in #technology and #ai' });

    await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ text: 'Another breakthrough in #AI today!' });

    const trendingRes = await request(app).get('/api/trending');
    expect(trendingRes.status).toBe(200);
    expect(trendingRes.body.trending.length).toBeGreaterThan(0);

    const topTag = trendingRes.body.trending[0];
    expect(topTag.tag).toBe('#ai');
    expect(topTag.count).toBe(2);
  });

  it('should search posts and users by query', async () => {
    await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ text: 'Quantum computing update' });

    const searchRes = await request(app).get('/api/search?q=quantum');
    expect(searchRes.status).toBe(200);
    expect(searchRes.body.posts.length).toBe(1);
    expect(searchRes.body.posts[0].text).toContain('Quantum computing');

    const userSearchRes = await request(app).get('/api/search?q=trendsetter');
    expect(userSearchRes.status).toBe(200);
    expect(userSearchRes.body.users.length).toBe(1);
    expect(userSearchRes.body.users[0].username).toBe('trendsetter');
  });
});
