const request = require('supertest');
import { createApp } from '../../src/app';
import { chatStore } from '../../src/services/store.service';

describe('Group Messaging API Integration', () => {
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
      .send({ email: 'u1@chat.test', username: 'u1', password: 'password123', name: 'User 1' });
    user1Token = res1.body.token;
    user1Id = res1.body.user.id;

    const res2 = await request(app)
      .post('/api/auth/register')
      .send({ email: 'u2@chat.test', username: 'u2', password: 'password123', name: 'User 2' });
    user2Token = res2.body.token;
    user2Id = res2.body.user.id;

    const res3 = await request(app)
      .post('/api/auth/register')
      .send({ email: 'u3@chat.test', username: 'u3', password: 'password123', name: 'User 3' });
    user3Token = res3.body.token;
    user3Id = res3.body.user.id;
  });

  it('should create group, manage members, and send messages', async () => {
    // User 1 creates group with User 2
    const groupRes = await request(app)
      .post('/api/conversations/group')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        title: 'Project Alpha',
        memberUserIds: [user2Id]
      });

    expect(groupRes.status).toBe(201);
    const groupId = groupRes.body.conversation.id;

    // User 1 adds User 3
    const addRes = await request(app)
      .post(`/api/groups/${groupId}/members`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ targetUserId: user3Id, role: 'MEMBER' });

    expect(addRes.status).toBe(200);

    // User 2 sends message in group
    const msgRes = await request(app)
      .post(`/api/conversations/${groupId}/messages`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ content: 'Welcome User 3 to Project Alpha!' });

    expect(msgRes.status).toBe(201);

    // User 3 reads conversation
    const fetchRes = await request(app)
      .get(`/api/conversations/${groupId}/messages`)
      .set('Authorization', `Bearer ${user3Token}`);

    expect(fetchRes.status).toBe(200);
    expect(fetchRes.body.messages.length).toBe(1);
    expect(fetchRes.body.messages[0].content).toContain('Welcome User 3');
  });

  it('should list conversations with unread counts', async () => {
    const groupRes = await request(app)
      .post('/api/conversations/group')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ title: 'Notifications Test', memberUserIds: [user2Id] });
    const groupId = groupRes.body.conversation.id;

    // User 1 sends message
    await request(app)
      .post(`/api/conversations/${groupId}/messages`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ content: 'Message for User 2' });

    // User 2 lists conversations: should show unreadCount = 1
    const listRes = await request(app)
      .get('/api/conversations')
      .set('Authorization', `Bearer ${user2Token}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.conversations.length).toBe(1);
    expect(listRes.body.conversations[0].unreadCount).toBe(1);
  });
});
