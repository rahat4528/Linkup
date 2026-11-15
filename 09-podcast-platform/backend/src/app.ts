const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
import { AuthController } from './controllers/auth.controller';
import { PodcastController } from './controllers/podcast.controller';
import { EpisodeController } from './controllers/episode.controller';
import { FeedController } from './controllers/feed.controller';
import { requireAuth, optionalAuth } from './middleware/auth.middleware';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  const authController = new AuthController();
  const podcastController = new PodcastController();
  const episodeController = new EpisodeController();
  const feedController = new FeedController();

  // Health check
  app.get('/health', (req: any, res: any) => {
    res.status(200).json({
      status: 'ok',
      service: 'podcast-platform-backend',
      timestamp: new Date().toISOString()
    });
  });

  // Auth routes
  app.post('/api/auth/register', (req: any, res: any) => authController.register(req, res));
  app.post('/api/auth/login', (req: any, res: any) => authController.login(req, res));
  app.get('/api/auth/me', requireAuth, (req: any, res: any) => authController.getProfile(req, res));

  // Podcast routes
  app.get('/api/podcasts', (req: any, res: any) => podcastController.getPodcasts(req, res));
  app.get('/api/podcasts/:id', (req: any, res: any) => podcastController.getPodcastById(req, res));
  app.post('/api/podcasts', requireAuth, (req: any, res: any) => podcastController.createPodcast(req, res));
  app.post('/api/podcasts/:id/subscribe', requireAuth, (req: any, res: any) => podcastController.toggleSubscription(req, res));

  // Episode routes
  app.get('/api/podcasts/:podcastId/episodes', (req: any, res: any) => episodeController.getEpisodesByPodcast(req, res));
  app.get('/api/episodes/:id', (req: any, res: any) => episodeController.getEpisodeById(req, res));
  app.post('/api/episodes', requireAuth, (req: any, res: any) => episodeController.createEpisode(req, res));

  // RSS Feed routes
  app.get('/api/podcasts/:id/feed.xml', (req: any, res: any) => feedController.getPodcastFeedXml(req, res));
  app.post('/api/feeds/validate', (req: any, res: any) => feedController.validateExternalFeed(req, res));

  // 404 handler
  app.use((req: any, res: any) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

  return app;
}

export const app = createApp();
