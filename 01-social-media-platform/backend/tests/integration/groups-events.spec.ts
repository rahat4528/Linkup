const request = require('supertest');
import { createApp } from '../../src/app';
import { memoryStore } from '../../src/services/store.service';

const app = createApp();

describe('Groups, Events & Stories Integration Tests', () => {
  let token1: string;
  let user1Id: string;
  let token2: string;
  let user2Id: string;

  beforeEach(async () => {
    memoryStore.clear();

    const u1 = await request(app).post('/api/v1/auth/register').send({
      email: 'organizer@example.com',
      username: 'organizer',
      password: 'Password123!',
      name: 'Community Organizer',
    });
    token1 = u1.body.token;
    user1Id = u1.body.user.id;

    const u2 = await request(app).post('/api/v1/auth/register').send({
      email: 'member@example.com',
      username: 'member',
      password: 'Password123!',
      name: 'Community Member',
    });
    token2 = u2.body.token;
    user2Id = u2.body.user.id;
  });

  it('creates public groups and allows members to join', async () => {
    const res = await request(app)
      .post('/api/v1/groups')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        name: 'Open Source Community',
        description: 'Collaborative engineering discussions',
        privacy: 'PUBLIC',
      });

    expect(res.status).toBe(201);
    const groupId = res.body.group.id;
    expect(res.body.membership.role).toBe('OWNER');

    const joinRes = await request(app)
      .post(`/api/v1/groups/${groupId}/join`)
      .set('Authorization', `Bearer ${token2}`);

    expect(joinRes.status).toBe(200);
    expect(joinRes.body.membership.role).toBe('MEMBER');
  });

  it('restricts private group details to active members only', async () => {
    const res = await request(app)
      .post('/api/v1/groups')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        name: 'Private Steering Committee',
        description: 'Internal discussions',
        privacy: 'PRIVATE',
      });
    const groupId = res.body.group.id;

    // Non-member access attempt should be rejected (403)
    const viewRes = await request(app)
      .get(`/api/v1/groups/${groupId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(viewRes.status).toBe(403);
    expect(viewRes.body.error).toContain('Membership required');
  });

  it('creates events and processes RSVP updates', async () => {
    const evtRes = await request(app)
      .post('/api/v1/events')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        title: 'Quarterly Hackathon 2026',
        description: 'Weekend of code and collaboration',
        location: 'Online Discord / Zoom',
        eventDate: '2026-12-15T10:00:00Z',
      });

    expect(evtRes.status).toBe(201);
    const eventId = evtRes.body.event.id;

    // Member RSVPs GOING
    const rsvpRes = await request(app)
      .post(`/api/v1/events/${eventId}/rsvp`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ status: 'GOING' });

    expect(rsvpRes.status).toBe(200);
    expect(rsvpRes.body.rsvp.status).toBe('GOING');
  });

  it('filters expired stories at query time', async () => {
    // 1. Create active story
    await request(app)
      .post('/api/v1/stories')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        mediaUrl: 'https://images.example.com/story-active.jpg',
        caption: 'Active 24h story',
      });

    // 2. Insert expired story directly into store
    memoryStore.stories.push({
      id: 'story_expired',
      authorId: user1Id,
      mediaUrl: 'https://images.example.com/story-old.jpg',
      caption: 'Expired story',
      createdAt: new Date(Date.now() - 48 * 3600 * 1000),
      expiresAt: new Date(Date.now() - 24 * 3600 * 1000), // expired 24h ago
    });

    const storiesRes = await request(app)
      .get('/api/v1/stories')
      .set('Authorization', `Bearer ${token1}`);

    expect(storiesRes.status).toBe(200);
    expect(storiesRes.body.stories.length).toBe(1);
    expect(storiesRes.body.stories[0].caption).toBe('Active 24h story');
  });
});
