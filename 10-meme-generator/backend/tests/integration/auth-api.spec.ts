const request = require('supertest');
import { app } from '../../src/app';

describe('Auth API - Meme Creators & Users', () => {
  const testUser = {
    email: `creator-${Date.now()}@memes.local`,
    username: `memer_${Date.now()}`,
    password: 'password123',
    displayName: 'Meme Enthusiast'
  };

  let token: string;

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
    token = res.body.token;
  });

  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('should retrieve authenticated profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testUser.email);
  });
});
