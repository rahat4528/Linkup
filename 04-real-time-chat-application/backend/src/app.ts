const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
import { AuthController } from './controllers/auth.controller';
import { ChatController } from './controllers/chat.controller';
import { MessageController } from './controllers/message.controller';
import { GroupController } from './controllers/group.controller';
import { SearchController } from './controllers/search.controller';
import { authMiddleware } from './middleware/auth.middleware';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Health
  app.get('/health', (req: any, res: any) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // Auth
  app.post('/api/auth/register', AuthController.register);
  app.post('/api/auth/login', AuthController.login);

  // Conversations
  app.get('/api/conversations', authMiddleware, ChatController.listConversations);
  app.post('/api/conversations/direct', authMiddleware, ChatController.getOrCreateDirect);
  app.post('/api/conversations/group', authMiddleware, ChatController.createGroup);
  app.get('/api/conversations/:id/messages', authMiddleware, ChatController.getMessages);

  // Messages
  app.post('/api/conversations/:conversationId/messages', authMiddleware, MessageController.sendMessage);
  app.put('/api/messages/:id', authMiddleware, MessageController.editMessage);
  app.delete('/api/messages/:id', authMiddleware, MessageController.deleteMessage);
  app.post('/api/messages/:id/reactions', authMiddleware, MessageController.toggleReaction);
  app.post('/api/messages/:id/read', authMiddleware, MessageController.markRead);

  // Group Administration
  app.post('/api/groups/:id/members', authMiddleware, GroupController.addMember);
  app.delete('/api/groups/:id/members/:userId', authMiddleware, GroupController.removeMember);
  app.put('/api/groups/:id/role', authMiddleware, GroupController.updateRole);
  app.put('/api/groups/:id/transfer-ownership', authMiddleware, GroupController.transferOwnership);

  // Search & Presence
  app.get('/api/search/messages', authMiddleware, SearchController.searchMessages);
  app.get('/api/search/users', authMiddleware, SearchController.searchUsers);
  app.get('/api/presence/:userId', authMiddleware, SearchController.getPresence);

  return app;
};
