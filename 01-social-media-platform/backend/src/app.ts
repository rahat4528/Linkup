const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
import { Application, Request, Response } from 'express';
import { rateLimiter } from './middleware/rate-limiter';
import { authMiddleware, optionalAuthMiddleware } from './middleware/auth.middleware';
import { AuthController } from './controllers/auth.controller';
import { UserController } from './controllers/user.controller';
import { FriendController } from './controllers/friend.controller';
import { PostController } from './controllers/post.controller';
import { GroupController } from './controllers/group.controller';
import { EventController } from './controllers/event.controller';
import { StoryController } from './controllers/story.controller';
import { ModerationController } from './controllers/moderation.controller';
import { NotificationController } from './controllers/notification.controller';

export function createApp(): Application {
  const app: Application = express();

  // Security & Utility Middlewares
  app.use(helmet());
  app.use(cors({ origin: '*', credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(rateLimiter(200, 60000));

  // Health Check
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', service: '01-social-media-platform-api', timestamp: new Date() });
  });

  const api = express.Router();

  // Auth Routes
  api.post('/auth/register', AuthController.register);
  api.post('/auth/login', AuthController.login);

  // User & Profile Routes
  api.get('/users/me', authMiddleware, UserController.getMe);
  api.patch('/users/me/profile', authMiddleware, UserController.updateProfile);
  api.delete('/users/me', authMiddleware, UserController.deleteAccount);
  api.get('/users/:id', optionalAuthMiddleware, UserController.getUserById);

  // Friends & Connections
  api.post('/friends/request/:targetUserId', authMiddleware, FriendController.sendRequest);
  api.post('/friends/request/:requestId/accept', authMiddleware, FriendController.acceptRequest);
  api.post('/friends/request/:requestId/reject', authMiddleware, FriendController.rejectRequest);
  api.delete('/friends/request/:requestId/cancel', authMiddleware, FriendController.cancelRequest);
  api.delete('/friends/:targetUserId', authMiddleware, FriendController.unfriend);
  api.get('/friends', authMiddleware, FriendController.getFriends);
  api.get('/friends/mutual/:targetUserId', authMiddleware, FriendController.getMutualFriends);
  api.get('/friends/suggestions', authMiddleware, FriendController.getSuggestions);
  api.post('/follow/:targetUserId', authMiddleware, FriendController.follow);
  api.delete('/follow/:targetUserId', authMiddleware, FriendController.unfollow);

  // Posts & Feed
  api.post('/posts', authMiddleware, PostController.createPost);
  api.get('/posts/feed', authMiddleware, PostController.getFeed);
  api.get('/posts/:id', optionalAuthMiddleware, PostController.getPostById);
  api.patch('/posts/:id', authMiddleware, PostController.updatePost);
  api.delete('/posts/:id', authMiddleware, PostController.deletePost);
  api.post('/posts/:id/reactions', authMiddleware, PostController.reactToPost);
  api.delete('/posts/:id/reactions', authMiddleware, PostController.removeReaction);
  api.post('/posts/:id/comments', authMiddleware, PostController.addComment);

  // Groups
  api.post('/groups', authMiddleware, GroupController.createGroup);
  api.get('/groups', optionalAuthMiddleware, GroupController.getGroups);
  api.get('/groups/:id', optionalAuthMiddleware, GroupController.getGroupById);
  api.post('/groups/:id/join', authMiddleware, GroupController.joinGroup);
  api.delete('/groups/:id/leave', authMiddleware, GroupController.leaveGroup);

  // Events
  api.post('/events', authMiddleware, EventController.createEvent);
  api.get('/events', optionalAuthMiddleware, EventController.getEvents);
  api.post('/events/:id/rsvp', authMiddleware, EventController.rsvpEvent);

  // Stories
  api.post('/stories', authMiddleware, StoryController.createStory);
  api.get('/stories', authMiddleware, StoryController.getActiveStories);

  // Moderation & Blocks
  api.post('/blocks/:targetUserId', authMiddleware, ModerationController.blockUser);
  api.delete('/blocks/:targetUserId', authMiddleware, ModerationController.unblockUser);
  api.post('/reports', authMiddleware, ModerationController.reportContent);
  api.get('/reports', authMiddleware, ModerationController.getReports);
  api.patch('/reports/:id', authMiddleware, ModerationController.updateReportStatus);

  // Notifications
  api.get('/notifications', authMiddleware, NotificationController.getNotifications);
  api.patch('/notifications/:id/read', authMiddleware, NotificationController.markAsRead);
  api.post('/notifications/read-all', authMiddleware, NotificationController.markAllAsRead);

  app.use('/api/v1', api);

  return app;
}
