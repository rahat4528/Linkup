const request = require('supertest');
import { createApp } from '../../src/app';
import { instaStore } from '../../src/services/store.service';

const app = createApp();

describe('Posts & Carousels Integration Tests', () => {
  let userToken: string;
  let userId: string;

  beforeEach(async () => {
    instaStore.clear();

    const reg = await request(app).post('/api/v1/auth/register').send({
      email: 'photographer@example.com',
      username: 'lensmaster',
      password: 'Password123!',
      name: 'Lens Master',
    });
    userToken = reg.body.token;
    userId = reg.body.user.id;
  });

  it('creates and retrieves a multi-image carousel post with hashtags', async () => {
    const postRes = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        caption: 'Golden hour reflections #nature #goldenhour',
        location: 'Yosemite Valley, CA',
        media: [
          { url: 'https://images.example.com/slide1.jpg', order: 0 },
          { url: 'https://images.example.com/slide2.jpg', order: 1 },
        ],
      });

    expect(postRes.status).toBe(201);
    expect(postRes.body.post.media.length).toBe(2);
    expect(postRes.body.post.status).toBe('READY');
    expect(postRes.body.tags).toContain('nature');
    expect(postRes.body.tags).toContain('goldenhour');

    // Retrieve user feed
    const feedRes = await request(app)
      .get('/api/v1/posts/feed')
      .set('Authorization', `Bearer ${userToken}`);

    expect(feedRes.status).toBe(200);
    expect(feedRes.body.feed.length).toBe(1);
    expect(feedRes.body.feed[0].media.length).toBe(2);
  });

  it('toggles likes idempotently and appends comments', async () => {
    const postRes = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        caption: 'Single photo spotlight #art',
        media: [{ url: 'https://images.example.com/art.jpg', order: 0 }],
      });
    const postId = postRes.body.post.id;

    // 1. Like post
    const like1 = await request(app)
      .post(`/api/v1/posts/${postId}/like`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(like1.status).toBe(200);
    expect(like1.body.isLiked).toBe(true);
    expect(like1.body.totalLikes).toBe(1);

    // 2. Unlike post (toggle)
    const like2 = await request(app)
      .post(`/api/v1/posts/${postId}/like`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(like2.status).toBe(200);
    expect(like2.body.isLiked).toBe(false);
    expect(like2.body.totalLikes).toBe(0);

    // 3. Comment on post
    const commentRes = await request(app)
      .post(`/api/v1/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ content: 'Remarkable composition!' });
    expect(commentRes.status).toBe(201);
    expect(commentRes.body.comment.content).toBe('Remarkable composition!');
  });
});
