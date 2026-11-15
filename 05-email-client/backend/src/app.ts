const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
import { AuthController } from './controllers/auth.controller';
import { EmailController } from './controllers/email.controller';
import { ThreadController } from './controllers/thread.controller';
import { DraftController } from './controllers/draft.controller';
import { LabelController } from './controllers/label.controller';
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

  // Emails & Folders
  app.get('/api/emails', authMiddleware, EmailController.listEmails);
  app.post('/api/emails/send', authMiddleware, EmailController.sendEmail);
  app.patch('/api/emails/:id/star', authMiddleware, EmailController.toggleStar);
  app.patch('/api/emails/:id/read', authMiddleware, EmailController.toggleRead);
  app.patch('/api/emails/:id/folder', authMiddleware, EmailController.moveToFolder);

  // Threads
  app.get('/api/threads/:threadId', authMiddleware, ThreadController.getThreadMessages);

  // Drafts
  app.post('/api/drafts', authMiddleware, DraftController.autosaveDraft);
  app.get('/api/drafts/:id', authMiddleware, DraftController.getDraft);
  app.delete('/api/drafts/:id', authMiddleware, DraftController.discardDraft);

  // Labels
  app.get('/api/labels', authMiddleware, LabelController.listLabels);
  app.post('/api/labels', authMiddleware, LabelController.createLabel);
  app.post('/api/emails/:id/labels', authMiddleware, LabelController.assignLabel);
  app.delete('/api/emails/:id/labels/:labelId', authMiddleware, LabelController.removeLabel);

  // Search
  app.get('/api/search', authMiddleware, SearchController.searchEmails);

  return app;
};
