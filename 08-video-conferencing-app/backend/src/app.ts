const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
import { AuthController } from './controllers/auth.controller';
import { RoomController } from './controllers/room.controller';
import { requireAuth, optionalAuth } from './middleware/auth.middleware';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  const authController = new AuthController();
  const roomController = new RoomController();

  // Health check
  app.get('/health', (req: any, res: any) => {
    res.status(200).json({
      status: 'ok',
      service: 'video-conferencing-backend',
      timestamp: new Date().toISOString()
    });
  });

  // Auth routes
  app.post('/api/auth/register', (req: any, res: any) => authController.register(req, res));
  app.post('/api/auth/login', (req: any, res: any) => authController.login(req, res));
  app.get('/api/auth/me', requireAuth, (req: any, res: any) => authController.getProfile(req, res));

  // Room routes
  app.post('/api/rooms', optionalAuth, (req: any, res: any) => roomController.createRoom(req, res));
  app.get('/api/rooms/:roomCode', (req: any, res: any) => roomController.getRoom(req, res));
  app.post('/api/rooms/:roomCode/token', (req: any, res: any) => roomController.joinRoomToken(req, res));
  app.post('/api/devices/test-audio', (req: any, res: any) => roomController.testDeviceAudio(req, res));

  // 404 handler
  app.use((req: any, res: any) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

  return app;
}

export const app = createApp();
