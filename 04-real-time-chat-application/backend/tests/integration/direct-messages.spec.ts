const request = require('supertest');
import { createApp } from '../../src/app';
import { chatStore } from '../../src/services/store.service';

describe('Direct Messaging API Integration', () => {
  let app: any;
  let user1Token: string;
  let user1Id: string;
  let user2Token: string;
  let user2Id: string;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(async () => {
    chatStore.clear();

    const res1 = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'alice@chat.test',
        username: 'alice',
        password: 'password123',
        name: 'Alice Johnson'
      });
    user1Token = res1.body.token;
    user1Id = res1.body.user.id;

    const res2 = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'bob@chat.test',
        username: 'bob',
        password: 'password123',
        name: 'Bob Smith'
      });
    user2Token = res2.body.token;
    user2Id = res2.body.user.id;
  });

  it('should create or get direct conversation between two users', async () => {
    const res = await request(app)
      .post('/api/conversations/direct')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ targetUserId: user2Id });

    expect(res.status).toBe(201);
    expect(res.body.conversation.type).toBe('DIRECT');

    // Calling again returns existing conversation
    const resExisting = await request(app)
      .post('/api/conversations/direct')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ targetUserId: user2Id });

    expect(resExisting.status).toBe(200);
    expect(resExisting.body.conversation.id).toBe(res.body.conversation.id);
  });

  it('should send, edit, react to, and soft-delete messages', async () => {
    const convRes = await request(app)
      .post('/api/conversations/direct')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ targetUserId: user2Id });
    const convId = convRes.body.conversation.id;

    // Send message
    const msgRes = await request(app)
      .post(`/api/conversations/${convId}/messages`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ content: 'Hello Bob! How are you?' });

    expect(msgRes.status).toBe(201);
    const msgId = msgRes.body.message.id;

    // Edit message
    const editRes = await request(app)
      .put(`/api/messages/${msgId}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ content: 'Hello Bob! How are you doing?' });

    expect(editRes.status).toBe(200);
    expect(editRes.body.message.isEdited).toBe(true);
    expect(editRes.body.message.content).toBe('Hello Bob! How are you doing?');

    // Add Reaction
    const reactRes = await request(app)
      .post(`/api/messages/${msgId}/reactions`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ emoji: '🔥' });

    expect(reactRes.status).toBe(201);
    expect(reactRes.body.reacted).toBe(true);

    // Soft delete message
    const delRes = await request(app)
      .delete(`/api/messages/${msgId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.tombstone).toBe('This message was deleted');

    // Fetch messages to verify tombstone
    const fetchRes = await request(app)
      .get(`/api/conversations/${convId}/messages`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect(fetchRes.status).toBe(200);
    expect(fetchRes.body.messages[0].content).toBe('This message was deleted');
    expect(fetchRes.body.messages[0].isDeleted).toBe(true);
  });
});
