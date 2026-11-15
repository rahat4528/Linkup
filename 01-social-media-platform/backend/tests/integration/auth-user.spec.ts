const request = require('supertest');
import { createApp } from '../../src/app';
import { memoryStore } from '../../src/services/store.service';

const app = createApp();

describe('Auth & User API Integration Tests', () => {
  beforeEach(() => {
    memoryStore.clear();
  });

  it('registers a new user and returns JWT token and profile', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'alice@example.com',
        username: 'alice',
        password: 'Password123!',
        name: 'Alice Johnson',
      });

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('alice@example.com');
    expect(res.body.token).toBeDefined();
    expect(memoryStore.users.length).toBe(1);
    expect(memoryStore.profiles.length).toBe(1);
  });

  it('rejects duplicate email and username registration', async () => {
    await request(app).post('/api/v1/auth/register').send({
      email: 'alice@example.com',
      username: 'alice',
      password: 'Password123!',
      name: 'Alice Johnson',
    });

    const dupEmail = await request(app).post('/api/v1/auth/register').send({
      email: 'alice@example.com',
      username: 'alice2',
      password: 'Password123!',
      name: 'Alice Two',
    });
    expect(dupEmail.status).toBe(409);

    const dupUsername = await request(app).post('/api/v1/auth/register').send({
      email: 'alice2@example.com',
      username: 'alice',
      password: 'Password123!',
      name: 'Alice Two',
    });
    expect(dupUsername.status).toBe(409);
  });

  it('authenticates user and returns profile and token on login', async () => {
    await request(app).post('/api/v1/auth/register').send({
      email: 'bob@example.com',
      username: 'bob',
      password: 'Password123!',
      name: 'Bob Smith',
    });

    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'bob@example.com',
      password: 'Password123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe('bob');
  });

  it('updates profile information and respects privacy boundaries', async () => {
    const reg = await request(app).post('/api/v1/auth/register').send({
      email: 'charlie@example.com',
      username: 'charlie',
      password: 'Password123!',
      name: 'Charlie Davis',
    });
    const token = reg.body.token;

    const updateRes = await request(app)
      .patch('/api/v1/users/me/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        bio: 'Senior Distributed Systems Engineer',
        location: 'Seattle, WA',
        profilePrivacy: 'FRIENDS',
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.profile.bio).toBe('Senior Distributed Systems Engineer');
    expect(updateRes.body.profile.profilePrivacy).toBe('FRIENDS');

    // A stranger viewing charlie's private profile should be denied (403)
    const strangerRes = await request(app).get(`/api/v1/users/${reg.body.user.id}`);
    expect(strangerRes.status).toBe(403);
  });

  it('supports account deletion and purges data', async () => {
    const reg = await request(app).post('/api/v1/auth/register').send({
      email: 'dana@example.com',
      username: 'dana',
      password: 'Password123!',
      name: 'Dana Vance',
    });
    const token = reg.body.token;

    const delRes = await request(app)
      .delete('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(delRes.status).toBe(200);
    expect(memoryStore.users.length).toBe(0);
  });
});
