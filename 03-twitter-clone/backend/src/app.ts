const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
import { AuthController } from './controllers/auth.controller';
import { PostController } from './controllers/post.controller';
import { PollController } from './controllers/poll.controller';
import { NotesController } from './controllers/notes.controller';
import { UserController } from './controllers/user.controller';
import { SearchController } from './controllers/search.controller';
import { authMiddleware, optionalAuthMiddleware } from './middleware/auth.middleware';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Health
  app.get('/health', (req: any, res: any) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // Auth routes
  app.post('/api/auth/register', AuthController.register);
  app.post('/api/auth/login', AuthController.login);

  // Post & Feed routes
  app.post('/api/posts', authMiddleware, PostController.createPost);
  app.get('/api/posts/thread/:conversationId', optionalAuthMiddleware, PostController.getThread);
  app.get('/api/posts/:id', optionalAuthMiddleware, PostController.getPost);
  app.put('/api/posts/:id', authMiddleware, PostController.editPost);
  app.delete('/api/posts/:id', authMiddleware, PostController.deletePost);
  app.post('/api/posts/:id/like', authMiddleware, PostController.toggleLike);
  app.post('/api/posts/:id/repost', authMiddleware, PostController.toggleRepost);
  app.post('/api/posts/:id/quote', authMiddleware, PostController.quotePost);

  app.get('/api/feed/following', authMiddleware, PostController.getFollowingFeed);
  app.get('/api/feed/for-you', authMiddleware, PostController.getForYouFeed);

  // Poll routes
  app.post('/api/polls/:pollId/vote', authMiddleware, PollController.vote);

  // Community Notes routes
  app.post('/api/posts/:postId/notes', authMiddleware, NotesController.proposeNote);
  app.get('/api/posts/:postId/notes', NotesController.getNotesForPost);
  app.post('/api/notes/:noteId/rate', authMiddleware, NotesController.rateNote);

  // User & Profile routes
  app.get('/api/users/:username', optionalAuthMiddleware, UserController.getProfile);
  app.put('/api/users/profile', authMiddleware, UserController.updateProfile);
  app.post('/api/users/:id/follow', authMiddleware, UserController.toggleFollow);
  app.post('/api/users/:id/mute', authMiddleware, UserController.muteUser);
  app.delete('/api/users/:id/mute', authMiddleware, UserController.unmuteUser);
  app.post('/api/users/:id/block', authMiddleware, UserController.blockUser);
  app.delete('/api/users/:id/block', authMiddleware, UserController.unblockUser);

  // Search & Trending routes
  app.get('/api/search', optionalAuthMiddleware, SearchController.search);
  app.get('/api/trending', SearchController.getTrending);

  return app;
};
