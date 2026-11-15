const http = require('http');
const { Server: SocketIOServer } = require('socket.io');
const { io: ClientIO } = require('socket.io-client');
const jwt = require('jsonwebtoken');
import { createApp } from '../../src/app';
import { config } from '../../src/config';
import { SocketService } from '../../src/services/socket.service';
import { memoryStore } from '../../src/services/store.service';

describe('Real-Time Socket.IO Authorization Tests', () => {
  let server: any;
  let serverPort: number;
  let validToken: string;
  const userId = 'user_socket_test';
  const otherUserId = 'user_other';

  beforeAll((done: any) => {
    const app = createApp();
    server = http.createServer(app);
    const ioServer = new SocketIOServer(server);
    SocketService.initialize(ioServer);

    server.listen(0, () => {
      serverPort = server.address().port;
      done();
    });
  });

  afterAll((done: any) => {
    if (server && server.close) {
      server.close(done);
    } else {
      done();
    }
  });

  beforeEach(() => {
    memoryStore.clear();

    memoryStore.users.push({
      id: userId,
      email: 'socket@example.com',
      username: 'socketuser',
      passwordHash: 'hash',
      name: 'Socket User',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    validToken = jwt.sign({ userId }, config.jwtSecret, { expiresIn: '1h' });
  });

  it('rejects connection when token is absent or invalid', (done) => {
    const socket = ClientIO(`http://localhost:${serverPort}`, {
      transports: ['websocket'],
      auth: { token: 'invalid_token' },
      reconnection: false,
    });

    socket.on('connect_error', (err: any) => {
      expect(err.message).toContain('Invalid or expired authentication token');
      socket.disconnect();
      done();
    });
  });

  it('connects successfully with valid JWT token', (done) => {
    const socket = ClientIO(`http://localhost:${serverPort}`, {
      transports: ['websocket'],
      auth: { token: validToken },
      reconnection: false,
    });

    socket.on('connect', () => {
      expect(socket.connected).toBe(true);
      socket.disconnect();
      done();
    });
  });

  it('denies join request to private group when user is not a member', (done) => {
    // Create private group with other user as owner
    memoryStore.groups.push({
      id: 'grp_secret',
      name: 'Secret Group',
      privacy: 'PRIVATE',
      creatorId: otherUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const socket = ClientIO(`http://localhost:${serverPort}`, {
      transports: ['websocket'],
      auth: { token: validToken },
      reconnection: false,
    });

    socket.on('connect', () => {
      socket.emit('join:group', 'grp_secret', (ack: { success: boolean; error?: string }) => {
        expect(ack.success).toBe(false);
        expect(ack.error).toContain('Private group member access required');
        socket.disconnect();
        done();
      });
    });
  });

  it('does not send notifications to blocked users', () => {
    // User blocks other user
    memoryStore.blocks.push({
      id: 'b1',
      blockerId: userId,
      blockedId: otherUserId,
      createdAt: new Date(),
    });

    const dispatched = SocketService.sendNotification({
      id: 'n1',
      userId: otherUserId,
      actorId: userId,
      type: 'TEST_EVENT',
      title: 'Should be suppressed',
      message: 'Blocked communication attempt',
      isRead: false,
      createdAt: new Date(),
    });

    expect(dispatched).toBe(false);
    expect(memoryStore.notifications.length).toBe(0);
  });
});
