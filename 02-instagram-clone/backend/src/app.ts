const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
import { Application, Request, Response } from 'express';
import { authMiddleware, optionalAuthMiddleware } from './middleware/auth.middleware';
import { AuthController } from './controllers/auth.controller';
import { ProfileController } from './controllers/profile.controller';
import { PostController } from './controllers/post.controller';
import { StoryController } from './controllers/story.controller';
import { ReelController } from './controllers/reel.controller';
import { ExploreController } from './controllers/explore.controller';
import { DmController } from './controllers/dm.controller';

export function createApp(): Application {
  const app: Application = express();

  app.use(helmet());
  app.use(cors({ origin: '*', credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', service: '02-instagram-clone-api', timestamp: new Date() });
  });

  const api = express.Router();

  // Auth
  api.post('/auth/register', AuthController.register);
  api.post('/auth/login', AuthController.login);

  // Profiles & Follows
  api.get('/profiles/:username', optionalAuthMiddleware, ProfileController.getProfileByUsername);
  api.patch('/profiles/me', authMiddleware, ProfileController.updateProfile);
  api.post('/users/:id/follow', authMiddleware, ProfileController.follow);
  api.delete('/users/:id/follow', authMiddleware, ProfileController.unfollow);
  api.post('/follow-requests/:requestId/approve', authMiddleware, ProfileController.approveFollowRequest);
  api.post('/follow-requests/:requestId/reject', authMiddleware, ProfileController.rejectFollowRequest);

  // Posts & Feed
  api.post('/posts', authMiddleware, PostController.createPost);
  api.get('/posts/feed', authMiddleware, PostController.getFeed);
  api.post('/posts/:id/like', authMiddleware, PostController.toggleLike);
  api.post('/posts/:id/comments', authMiddleware, PostController.addComment);

  // Stories
  api.post('/stories', authMiddleware, StoryController.createStory);
  api.get('/stories', authMiddleware, StoryController.getActiveStories);
  api.post('/stories/:id/view', authMiddleware, StoryController.recordStoryView);

  // Reels
  api.post('/reels', authMiddleware, ReelController.createReel);
  api.get('/reels/feed', optionalAuthMiddleware, ReelController.getReelsFeed);

  // Explore & Hashtags
  api.get('/explore', optionalAuthMiddleware, ExploreController.getExplore);
  api.get('/tags/:hashtag', optionalAuthMiddleware, ExploreController.getTagFeed);

  // Direct Messages
  api.post('/messages', authMiddleware, DmController.sendMessage);
  api.get('/messages/:partnerId', authMiddleware, DmController.getConversation);

  app.use('/api/v1', api);

  return app;
}
