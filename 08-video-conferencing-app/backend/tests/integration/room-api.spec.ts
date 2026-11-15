const request = require('supertest');
import { app } from '../../src/app';

describe('Room Management & Join API', () => {
  it('should retrieve existing room status', async () => {
    const res = await request(app).get('/api/rooms/eng-sync-2026');
    expect(res.status).toBe(200);
    expect(res.body.roomCode).toBe('eng-sync-2026');
    expect(res.body.title).toContain('Engineering Sync');
    expect(res.body.waitingRoomEnabled).toBe(true);
  });

  it('should return 404 for non-existent room', async () => {
    const res = await request(app).get('/api/rooms/non-existent-room-code');
    expect(res.status).toBe(404);
  });

  it('should generate join token for attendee', async () => {
    const res = await request(app)
      .post('/api/rooms/eng-sync-2026/token')
      .send({ displayName: 'Dev Tester' });

    expect(res.status).toBe(200);
    expect(res.body.joinToken).toBeDefined();
    expect(res.body.peerId).toBeDefined();
    expect(res.body.waitingRoomRequired).toBe(true);
  });

  it('should create a new meeting room', async () => {
    const res = await request(app)
      .post('/api/rooms')
      .send({
        title: 'Design Review Sprint 42',
        waitingRoomEnabled: false
      });

    expect(res.status).toBe(201);
    expect(res.body.roomCode).toBeDefined();
    expect(res.body.title).toBe('Design Review Sprint 42');
    expect(res.body.joinToken).toBeDefined();
  });
});
