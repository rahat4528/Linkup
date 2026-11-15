const request = require('supertest');
import { createApp } from '../../src/app';
import { memoryStore } from '../../src/services/store.service';

const app = createApp();

describe('Blocking & Moderation Safety Tests', () => {
  let userAToken: string;
  let userAId: string;
  let userBToken: string;
  let userBId: string;

  beforeEach(async () => {
    memoryStore.clear();

    const uA = await request(app).post('/api/v1/auth/register').send({
      email: 'usera@example.com',
      username: 'usera',
      password: 'Password123!',
      name: 'User A',
    });
    userAToken = uA.body.token;
    userAId = uA.body.user.id;

    const uB = await request(app).post('/api/v1/auth/register').send({
      email: 'userb@example.com',
      username: 'userb',
      password: 'Password123!',
      name: 'User B',
    });
    userBToken = uB.body.token;
    userBId = uB.body.user.id;

    // Establish friendship first
    memoryStore.friendships.push(
      { id: 'f1', userAId: userAId, userBId: userBId, createdAt: new Date() },
      { id: 'f2', userAId: userBId, userBId: userAId, createdAt: new Date() }
    );
  });

  it('blocking severs mutual connections and excludes content from both feeds', async () => {
    // Both users create a post
    await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ content: 'Post by User A', visibility: 'PUBLIC' });

    await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ content: 'Post by User B', visibility: 'PUBLIC' });

    // User A blocks User B
    const blockRes = await request(app)
      .post(`/api/v1/blocks/${userBId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(blockRes.status).toBe(200);
    expect(blockRes.body.message).toContain('User blocked and connections severed');

    // Friendships must be purged
    expect(memoryStore.friendships.length).toBe(0);

    // User A's feed should not include User B's post
    const feedA = await request(app)
      .get('/api/v1/posts/feed')
      .set('Authorization', `Bearer ${userAToken}`);
    expect(feedA.body.items.some((p: any) => p.authorId === userBId)).toBe(false);

    // User B's feed should not include User A's post
    const feedB = await request(app)
      .get('/api/v1/posts/feed')
      .set('Authorization', `Bearer ${userBToken}`);
    expect(feedB.body.items.some((p: any) => p.authorId === userAId)).toBe(false);
  });

  it('submits reports and verifies moderation queue', async () => {
    const postRes = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ content: 'Spammy or inappropriate post', visibility: 'PUBLIC' });
    const postId = postRes.body.post.id;

    // User B reports post
    const repRes = await request(app)
      .post('/api/v1/reports')
      .set('Authorization', `Bearer ${userBToken}`)
      .send({
        targetType: 'POST',
        targetId: postId,
        reason: 'SPAM',
        description: 'Contains repeated spam links',
      });

    expect(repRes.status).toBe(201);
    expect(repRes.body.report.status).toBe('PENDING');
    expect(memoryStore.reports.length).toBe(1);
  });
});
