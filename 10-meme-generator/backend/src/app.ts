const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
import { AuthController } from './controllers/auth.controller';
import { TemplateController } from './controllers/template.controller';
import { MemeController } from './controllers/meme.controller';
import { RenderController } from './controllers/render.controller';
import { requireAuth, optionalAuth } from './middleware/auth.middleware';

export function createApp() {
  const app = express();

  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  const authController = new AuthController();
  const templateController = new TemplateController();
  const memeController = new MemeController();
  const renderController = new RenderController();

  // Health check
  app.get('/health', (req: any, res: any) => {
    res.status(200).json({
      status: 'ok',
      service: 'meme-generator-backend',
      timestamp: new Date().toISOString()
    });
  });

  // Auth routes
  app.post('/api/auth/register', (req: any, res: any) => authController.register(req, res));
  app.post('/api/auth/login', (req: any, res: any) => authController.login(req, res));
  app.get('/api/auth/me', requireAuth, (req: any, res: any) => authController.getProfile(req, res));

  // Template routes
  app.get('/api/templates', (req: any, res: any) => templateController.getTemplates(req, res));
  app.get('/api/templates/:id', (req: any, res: any) => templateController.getTemplateById(req, res));

  // Meme routes
  app.get('/api/memes', (req: any, res: any) => memeController.getMemes(req, res));
  app.get('/api/memes/:id', (req: any, res: any) => memeController.getMemeById(req, res));
  app.post('/api/memes', optionalAuth, (req: any, res: any) => memeController.createMeme(req, res));
  app.post('/api/memes/:id/upvote', (req: any, res: any) => memeController.upvoteMeme(req, res));

  // Server-side Render routes
  app.post('/api/render', (req: any, res: any) => renderController.renderMemeSvg(req, res));
  app.get('/api/memes/:id/render', (req: any, res: any) => renderController.renderSavedMeme(req, res));

  // 404 handler
  app.use((req: any, res: any) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

  return app;
}

export const app = createApp();
