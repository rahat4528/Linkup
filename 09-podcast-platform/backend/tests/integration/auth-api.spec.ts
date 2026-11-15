const request = require('supertest');
import { app } from '../../src/app';

describe('Auth API - Podcast Platform Users & Creators', () => {
  const testUser = {
    email: `creator-${Date.now()}@podcasts.local`,
    username: `podcaster_${Date.now()}`,
    password: 'password123',
    displayName: 'Podcast Producer',
    role: 'CREATOR'
  };

  let token: string;

  it('should register a new podcast creator', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('CREATOR');
    token = res.body.token;
  });

  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('should get authenticated creator profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testUser.email);
  });
});
