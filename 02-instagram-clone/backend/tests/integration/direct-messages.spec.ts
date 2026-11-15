const request = require('supertest');
import { createApp } from '../../src/app';
import { instaStore } from '../../src/services/store.service';

const app = createApp();

describe('Direct Messages Integration Tests', () => {
  let user1Token: string;
  let user1Id: string;
  let user2Token: string;
  let user2Id: string;

  beforeEach(async () => {
    instaStore.clear();

    const u1 = await request(app).post('/api/v1/auth/register').send({
      email: 'dm1@example.com',
      username: 'dmuser1',
      password: 'Password123!',
      name: 'DM User 1',
    });
    user1Token = u1.body.token;
    user1Id = u1.body.user.id;

    const u2 = await request(app).post('/api/v1/auth/register').send({
      email: 'dm2@example.com',
      username: 'dmuser2',
      password: 'Password123!',
      name: 'DM User 2',
    });
    user2Token = u2.body.token;
    user2Id = u2.body.user.id;
  });

  it('exchanges one-to-one direct messages and returns conversation history', async () => {
    // User 1 sends message to User 2
    const sendRes = await request(app)
      .post('/api/v1/messages')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        recipientId: user2Id,
        content: 'Hi! Loved your recent carousel upload.',
      });

    expect(sendRes.status).toBe(201);
    expect(sendRes.body.message.content).toContain('Loved your recent carousel');

    // User 2 retrieves conversation with User 1
    const convRes = await request(app)
      .get(`/api/v1/messages/${user1Id}`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect(convRes.status).toBe(200);
    expect(convRes.body.messages.length).toBe(1);
    expect(convRes.body.messages[0].content).toContain('Loved your recent carousel');
  });
});
