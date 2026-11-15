const request = require('supertest');
import { createApp } from '../../src/app';
import { twitterStore } from '../../src/services/store.service';

describe('Posts, Replies and Engagements API', () => {
  let app: any;
  let userToken: string;
  let userId: string;

  beforeAll(async () => {
    app = createApp();
  });

  beforeEach(async () => {
    twitterStore.clear();

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'alice@microblog.com',
        username: 'alice',
        password: 'password123',
        name: 'Alice Dev'
      });

    userToken = res.body.token;
    userId = res.body.user.id;
  });

  it('should create root post and enforce 280 character limit', async () => {
    const validRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ text: 'Hello microblog world! 🚀 https://example.com' });

    expect(validRes.status).toBe(201);
    expect(validRes.body.post.conversationId).toBe(validRes.body.post.id);

    // Over 280 characters
    const overLimitRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ text: 'x'.repeat(281) });

    expect(overLimitRes.status).toBe(400);
    expect(overLimitRes.body.error).toContain('character limit');
  });

  it('should support threaded replies and retrieve full thread', async () => {
    const rootRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ text: 'Root post thread' });

    const rootId = rootRes.body.post.id;

    const replyRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ text: 'First reply', parentId: rootId });

    expect(replyRes.status).toBe(201);
    expect(replyRes.body.post.parentId).toBe(rootId);
    expect(replyRes.body.post.conversationId).toBe(rootId);

    const threadRes = await request(app)
      .get(`/api/posts/thread/${rootId}`);

    expect(threadRes.status).toBe(200);
    expect(threadRes.body.count).toBe(2);
    expect(threadRes.body.posts[0].id).toBe(rootId);
    expect(threadRes.body.posts[1].id).toBe(replyRes.body.post.id);
  });

  it('should toggle likes and reposts', async () => {
    const postRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ text: 'Liking and reposting this!' });

    const postId = postRes.body.post.id;

    // Like
    const like1 = await request(app)
      .post(`/api/posts/${postId}/like`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(like1.status).toBe(200);
    expect(like1.body.liked).toBe(true);

    // Unlike
    const like2 = await request(app)
      .post(`/api/posts/${postId}/like`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(like2.status).toBe(200);
    expect(like2.body.liked).toBe(false);

    // Repost
    const repost1 = await request(app)
      .post(`/api/posts/${postId}/repost`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(repost1.status).toBe(200);
    expect(repost1.body.reposted).toBe(true);
  });

  it('should allow editing post within 60 minutes and track history', async () => {
    const postRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ text: 'Typo in this post' });

    const postId = postRes.body.post.id;

    const editRes = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ text: 'Fixed typo in this post' });

    expect(editRes.status).toBe(200);
    expect(editRes.body.post.isEdited).toBe(true);
    expect(editRes.body.post.text).toBe('Fixed typo in this post');
    expect(twitterStore.editHistories.length).toBe(1);
    expect(twitterStore.editHistories[0].text).toBe('Typo in this post');
  });

  it('should apply tombstone when post is deleted to preserve reply tree', async () => {
    const rootRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ text: 'To be deleted root' });

    const rootId = rootRes.body.post.id;

    const delRes = await request(app)
      .delete(`/api/posts/${rootId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.post.isDeleted).toBe(true);
    expect(delRes.body.post.text).toBe('[This post has been deleted]');
  });
});
