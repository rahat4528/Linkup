const request = require('supertest');
import { createApp } from '../../src/app';
import { instaStore } from '../../src/services/store.service';

const app = createApp();

describe('Private Account Gating & Approval Flow Tests', () => {
  let privateToken: string;
  let privateUserId: string;
  let viewerToken: string;
  let viewerUserId: string;

  beforeEach(async () => {
    instaStore.clear();

    // 1. Create Private Account
    const privUser = await request(app).post('/api/v1/auth/register').send({
      email: 'private@example.com',
      username: 'privateuser',
      password: 'Password123!',
      name: 'Private Creator',
    });
    privateToken = privUser.body.token;
    privateUserId = privUser.body.user.id;

    // Toggle private mode on
    await request(app)
      .patch('/api/v1/profiles/me')
      .set('Authorization', `Bearer ${privateToken}`)
      .send({ isPrivate: true });

    // Private user publishes a post
    await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${privateToken}`)
      .send({
        caption: 'Secret family holiday photos',
        media: [{ url: 'https://images.example.com/secret.jpg' }],
      });

    // 2. Create Viewer Account
    const viewUser = await request(app).post('/api/v1/auth/register').send({
      email: 'viewer@example.com',
      username: 'curiousviewer',
      password: 'Password123!',
      name: 'Curious Viewer',
    });
    viewerToken = viewUser.body.token;
    viewerUserId = viewUser.body.user.id;
  });

  it('restricts private profile grid and feed to unapproved accounts, then unlocks on approval', async () => {
    // 1. Viewer inspects private profile -> locked
    const lockedProfile = await request(app)
      .get('/api/v1/profiles/privateuser')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(lockedProfile.status).toBe(200);
    expect(lockedProfile.body.relationship.isLocked).toBe(true);
    expect(lockedProfile.body.posts.length).toBe(0);

    // 2. Viewer sends follow request
    const followReqRes = await request(app)
      .post(`/api/v1/users/${privateUserId}/follow`)
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(followReqRes.status).toBe(201);
    expect(followReqRes.body.status).toBe('PENDING');

    const requestId = followReqRes.body.request.id;

    // 3. Private user approves request
    const approveRes = await request(app)
      .post(`/api/v1/follow-requests/${requestId}/approve`)
      .set('Authorization', `Bearer ${privateToken}`);

    expect(approveRes.status).toBe(200);

    // 4. Viewer inspects profile again -> unlocked!
    const unlockedProfile = await request(app)
      .get('/api/v1/profiles/privateuser')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(unlockedProfile.status).toBe(200);
    expect(unlockedProfile.body.relationship.isLocked).toBe(false);
    expect(unlockedProfile.body.posts.length).toBe(1);

    // 5. Post now appears in viewer feed
    const viewerFeed = await request(app)
      .get('/api/v1/posts/feed')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(viewerFeed.body.feed.length).toBe(1);
    expect(viewerFeed.body.feed[0].caption).toContain('Secret family holiday');
  });
});
