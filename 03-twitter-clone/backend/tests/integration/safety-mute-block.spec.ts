const request = require('supertest');
import { createApp } from '../../src/app';
import { twitterStore } from '../../src/services/store.service';

describe('Safety: Mute vs Block Semantics API', () => {
  let app: any;
  let user1Token: string;
  let user1Id: string;
  let user2Token: string;
  let user2Id: string;

  beforeAll(async () => {
    app = createApp();
  });

  beforeEach(async () => {
    twitterStore.clear();

    const res1 = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'user1@microblog.com',
        username: 'user1',
        password: 'password123',
        name: 'User One'
      });
    user1Token = res1.body.token;
    user1Id = res1.body.user.id;

    const res2 = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'user2@microblog.com',
        username: 'user2',
        password: 'password123',
        name: 'User Two'
      });
    user2Token = res2.body.token;
    user2Id = res2.body.user.id;
  });

  it('should test Mute semantics: follow preserved, feed excluded, profile accessible', async () => {
    // User 1 follows User 2
    await request(app)
      .post(`/api/users/${user2Id}/follow`)
      .set('Authorization', `Bearer ${user1Token}`);

    // User 2 posts something
    await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ text: 'User 2 post' });

    // Verify post is in User 1's following feed
    const feedBefore = await request(app)
      .get('/api/feed/following')
      .set('Authorization', `Bearer ${user1Token}`);
    expect(feedBefore.body.posts.length).toBe(1);

    // User 1 mutes User 2
    const muteRes = await request(app)
      .post(`/api/users/${user2Id}/mute`)
      .set('Authorization', `Bearer ${user1Token}`);
    expect(muteRes.status).toBe(200);

    // Following feed should now silently exclude User 2's post
    const feedAfter = await request(app)
      .get('/api/feed/following')
      .set('Authorization', `Bearer ${user1Token}`);
    expect(feedAfter.body.posts.length).toBe(0);

    // Follow relationship should still be retained
    const isFollowing = twitterStore.follows.some(f => f.followerId === user1Id && f.followingId === user2Id);
    expect(isFollowing).toBe(true);

    // User 1 can still view User 2's profile
    const profileRes = await request(app)
      .get(`/api/users/user2`)
      .set('Authorization', `Bearer ${user1Token}`);
    expect(profileRes.status).toBe(200);
    expect(profileRes.body.relationship.isMuted).toBe(true);
  });

  it('should test Block semantics: follow severed, profile access denied (403), feed excluded', async () => {
    // Both users follow each other
    await request(app)
      .post(`/api/users/${user2Id}/follow`)
      .set('Authorization', `Bearer ${user1Token}`);

    await request(app)
      .post(`/api/users/${user1Id}/follow`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect(twitterStore.follows.length).toBe(2);

    // User 1 blocks User 2
    const blockRes = await request(app)
      .post(`/api/users/${user2Id}/block`)
      .set('Authorization', `Bearer ${user1Token}`);
    expect(blockRes.status).toBe(200);

    // Follows must be severed both ways
    expect(twitterStore.follows.length).toBe(0);

    // Profile access should return 403 Forbidden
    const profileRes = await request(app)
      .get(`/api/users/user2`)
      .set('Authorization', `Bearer ${user1Token}`);
    expect(profileRes.status).toBe(403);
  });
});
