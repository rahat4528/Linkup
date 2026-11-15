const request = require('supertest');
import { createApp } from '../../src/app';
import { chatStore } from '../../src/services/store.service';
import { PresenceService } from '../../src/services/presence.service';

describe('Search and Presence API Integration', () => {
  let app: any;
  let user1Token: string;
  let user1Id: string;
  let user2Token: string;
  let user2Id: string;
  let user3Token: string;
  let user3Id: string;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(async () => {
    chatStore.clear();

    const res1 = await request(app)
      .post('/api/auth/register')
      .send({ email: 's1@chat.test', username: 's1', password: 'password123', name: 'Searcher One' });
    user1Token = res1.body.token;
    user1Id = res1.body.user.id;

    const res2 = await request(app)
      .post('/api/auth/register')
      .send({ email: 's2@chat.test', username: 's2', password: 'password123', name: 'Searcher Two' });
    user2Token = res2.body.token;
    user2Id = res2.body.user.id;

    const res3 = await request(app)
      .post('/api/auth/register')
      .send({ email: 's3@chat.test', username: 's3', password: 'password123', name: 'Searcher Three' });
    user3Token = res3.body.token;
    user3Id = res3.body.user.id;
  });

  it('should search messages across user conversations and exclude unauthorized conversations', async () => {
    // Conversation between User 1 and User 2
    const conv1Res = await request(app)
      .post('/api/conversations/direct')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ targetUserId: user2Id });
    const conv1Id = conv1Res.body.conversation.id;

    await request(app)
      .post(`/api/conversations/${conv1Id}/messages`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ content: 'Confidential project roadmap 2026' });

    // Private Conversation between User 2 and User 3 (User 1 is not in it)
    const conv2Res = await request(app)
      .post('/api/conversations/direct')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ targetUserId: user3Id });
    const conv2Id = conv2Res.body.conversation.id;

    await request(app)
      .post(`/api/conversations/${conv2Id}/messages`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ content: 'Another confidential secret roadmap' });

    // User 1 searches for 'roadmap'
    const searchRes = await request(app)
      .get('/api/search/messages?q=roadmap')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(searchRes.status).toBe(200);
    expect(searchRes.body.count).toBe(1);
    expect(searchRes.body.messages[0].conversationId).toBe(conv1Id);
  });

  it('should retrieve accurate presence for users', async () => {
    PresenceService.setOnline(user2Id);

    const presenceRes = await request(app)
      .get(`/api/presence/${user2Id}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(presenceRes.status).toBe(200);
    expect(presenceRes.body.status).toBe('ONLINE');
  });
});
