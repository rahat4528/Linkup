const request = require('supertest');
import { app } from '../../src/app';

describe('Template API', () => {
  it('should list all meme templates', async () => {
    const res = await request(app).get('/api/templates');
    expect(res.status).toBe(200);
    expect(res.body.templates).toBeInstanceOf(Array);
    expect(res.body.templates.length).toBeGreaterThanOrEqual(3);
  });

  it('should filter templates by category', async () => {
    const res = await request(app).get('/api/templates?category=Decisions');
    expect(res.status).toBe(200);
    expect(res.body.templates[0].category).toBe('Decisions');
  });

  it('should get template by slug or ID', async () => {
    const res = await request(app).get('/api/templates/two-diverging-paths');
    expect(res.status).toBe(200);
    expect(res.body.template.name).toBe('Two Diverging Paths');
  });

  it('should return 404 for invalid template', async () => {
    const res = await request(app).get('/api/templates/unknown-template');
    expect(res.status).toBe(404);
  });
});
