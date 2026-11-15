const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
import { AuthController } from './controllers/auth.controller';
import { TrackController } from './controllers/track.controller';
import { StreamController } from './controllers/stream.controller';
import { requireAuth, optionalAuth } from './middleware/auth.middleware';

export function createApp() {
  const app = express();

  // Basic security and parsing
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));
  app.use(cors());
  app.use(express.json({ limit: '15mb' }));

  const authController = new AuthController();
  const trackController = new TrackController();
  const streamController = new StreamController();

  // Health check
  app.get('/health', (req: any, res: any) => {
    res.status(200).json({ status: 'ok', service: 'music-streaming-backend', timestamp: new Date().toISOString() });
  });

  // Auth routes
  app.post('/api/auth/register', (req: any, res: any) => authController.register(req, res));
  app.post('/api/auth/login', (req: any, res: any) => authController.login(req, res));
  app.get('/api/auth/me', requireAuth, (req: any, res: any) => authController.getProfile(req, res));

  // Track routes
  app.get('/api/tracks', (req: any, res: any) => trackController.getTracks(req, res));
  app.get('/api/tracks/:id', (req: any, res: any) => trackController.getTrackById(req, res));
  app.post('/api/tracks', optionalAuth, (req: any, res: any) => trackController.createTrack(req, res));
  app.get('/api/tracks/:id/waveform', (req: any, res: any) => trackController.getWaveform(req, res));
  app.post('/api/tracks/:id/favorite', requireAuth, (req: any, res: any) => trackController.toggleFavorite(req, res));

  // Streaming routes
  app.get('/api/stream/:id', (req: any, res: any) => streamController.streamTrack(req, res));
  app.get('/api/stream-stats', (req: any, res: any) => streamController.getStreamStats(req, res));

  // 404 handler
  app.use((req: any, res: any) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

  return app;
}

export const app = createApp();
