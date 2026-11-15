const request = require('supertest');
import { app } from '../../src/app';

describe('Render API - Server-side SVG Compositing', () => {
  it('should render custom layers into SVG image', async () => {
    const res = await request(app)
      .post('/api/render')
      .send({
        width: 600,
        height: 600,
        baseImageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&fit=crop',
        layers: [
          { type: 'text', text: 'SERVER RENDER TEST', x: 300, y: 80 }
        ]
      });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('image/svg+xml');
    const svgText = res.text || res.body.toString();
    expect(svgText).toContain('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"');
    expect(svgText).toContain('SERVER RENDER TEST');
  });

  it('should render saved meme by ID', async () => {
    const res = await request(app).get('/api/memes/meme-friday-deploy/render');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('image/svg+xml');
    const svgText = res.text || res.body.toString();
    expect(svgText).toContain('WRITE TESTS BEFORE DEPLOYING');
  });

  it('should return 404 for non-existent meme render', async () => {
    const res = await request(app).get('/api/memes/non-existent-meme/render');
    expect(res.status).toBe(404);
  });
});
