const request = require('supertest');
import { app } from '../../src/app';

describe('Meme Creation & Gallery API', () => {
  it('should list public memes in community gallery', async () => {
    const res = await request(app).get('/api/memes');
    expect(res.status).toBe(200);
    expect(res.body.memes).toBeInstanceOf(Array);
    expect(res.body.memes.length).toBeGreaterThanOrEqual(1);
  });

  it('should retrieve a meme by ID', async () => {
    const res = await request(app).get('/api/memes/meme-friday-deploy');
    expect(res.status).toBe(200);
    expect(res.body.meme.title).toBe('Deploying on Friday Evening');
    expect(res.body.meme.layers.length).toBe(2);
  });

  it('should create a new meme with validated layers', async () => {
    const res = await request(app)
      .post('/api/memes')
      .send({
        title: 'Merge Without Review',
        templateId: 'tmpl-diverging-paths',
        layers: [
          { type: 'text', text: 'WAIT FOR APPROVAL', x: 300, y: 70 },
          { type: 'text', text: 'GIT PUSH --FORCE', x: 300, y: 530 }
        ]
      });

    expect(res.status).toBe(201);
    expect(res.body.meme.title).toBe('Merge Without Review');
    expect(res.body.meme.layers.length).toBe(2);
  });

  it('should upvote a meme', async () => {
    const res = await request(app).post('/api/memes/meme-friday-deploy/upvote');
    expect(res.status).toBe(200);
    expect(res.body.upvotes).toBeGreaterThanOrEqual(85);
  });
});
