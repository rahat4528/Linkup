const request = require('supertest');
import { createApp } from '../../src/app';
import { memoryStore } from '../../src/services/store.service';

const app = createApp();

describe('Posts & Feed Integration Tests', () => {
  let userToken: string;
  let userId: string;

  beforeEach(async () => {
    memoryStore.clear();

    const reg = await request(app).post('/api/v1/auth/register').send({
      email: 'postuser@example.com',
      username: 'postuser',
      password: 'Password123!',
      name: 'Post User',
    });
    userToken = reg.body.token;
    userId = reg.body.user.id;
  });

  it('creates and retrieves a new post', async () => {
    const res = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        content: 'Building Linkup Phase 1: High performance community network!',
        visibility: 'PUBLIC',
      });

    expect(res.status).toBe(201);
    expect(res.body.post).toBeDefined();
    expect(res.body.post.content).toContain('Phase 1');

    const feed = await request(app)
      .get('/api/v1/posts/feed')
      .set('Authorization', `Bearer ${userToken}`);

    expect(feed.status).toBe(200);
    expect(feed.body.items.length).toBe(1);
    expect(feed.body.items[0].content).toContain('Phase 1');
  });

  it('enforces reaction idempotency (upsert: one reaction per user per post)', async () => {
    const postRes = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        content: 'React to this milestone!',
        visibility: 'PUBLIC',
      });
    const postId = postRes.body.post.id;

    // React with LIKE
    const r1 = await request(app)
      .post(`/api/v1/posts/${postId}/reactions`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ type: 'LIKE' });
    expect(r1.status).toBe(200);
    expect(r1.body.totalReactions).toBe(1);
    expect(r1.body.userReaction).toBe('LIKE');

    // React again with LOVE - must update, not duplicate
    const r2 = await request(app)
      .post(`/api/v1/posts/${postId}/reactions`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ type: 'LOVE' });
    expect(r2.status).toBe(200);
    expect(r2.body.totalReactions).toBe(1);
    expect(r2.body.userReaction).toBe('LOVE');
    expect(memoryStore.reactions.length).toBe(1);

    // Remove reaction
    const r3 = await request(app)
      .delete(`/api/v1/posts/${postId}/reactions`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(r3.status).toBe(200);
    expect(r3.body.totalReactions).toBe(0);
  });

  it('adds comments to a post and records in feed', async () => {
    const postRes = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        content: 'Open discussion post',
        visibility: 'PUBLIC',
      });
    const postId = postRes.body.post.id;

    const commRes = await request(app)
      .post(`/api/v1/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        content: 'First insightful comment on this thread.',
      });

    expect(commRes.status).toBe(201);
    expect(commRes.body.comment.content).toBe('First insightful comment on this thread.');
    expect(memoryStore.comments.length).toBe(1);
  });

  it('allows author to edit their post with isEdited flag set', async () => {
    const postRes = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ content: 'Original text draft' });
    const postId = postRes.body.post.id;

    const editRes = await request(app)
      .patch(`/api/v1/posts/${postId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ content: 'Polished finalized text' });

    expect(editRes.status).toBe(200);
    expect(editRes.body.post.content).toBe('Polished finalized text');
    expect(editRes.body.post.isEdited).toBe(true);
  });
});
