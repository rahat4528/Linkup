import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
const jwt = require('jsonwebtoken');
import { createApp } from '../../src/app';
import { config } from '../../src/config';
import { SocketService } from '../../src/services/socket.service';
import { chatStore } from '../../src/services/store.service';

describe('WebSocket / Socket.IO Gateway Events', () => {
  let httpServer: http.Server;
  let port: number;
  let serverIO: SocketIOServer;
  let validToken: string;
  let clientSocket: ClientSocket;

  beforeAll((done) => {
    const app = createApp();
    httpServer = http.createServer(app);
    serverIO = new SocketIOServer(httpServer);
    SocketService.initialize(serverIO);

    httpServer.listen(() => {
      const addr = httpServer.address();
      port = typeof addr === 'object' && addr ? addr.port : 3003;

      validToken = jwt.sign(
        { id: 'usr_socket_tester', username: 'socket_tester', email: 'socket@test.local' },
        config.jwtSecret,
        { expiresIn: '1h' }
      );
      done();
    });
  });

  afterAll((done) => {
    serverIO.close();
    httpServer.close(done);
  });

  beforeEach(() => {
    chatStore.clear();
  });

  afterEach(() => {
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
    }
  });

  it('should reject connection without valid authentication token', (done) => {
    const unauthenticatedSocket = Client(`http://localhost:${port}`, {
      auth: { token: 'invalid_token' },
      transports: ['websocket'],
      autoConnect: true
    });

    unauthenticatedSocket.on('connect_error', (err) => {
      expect(err.message).toContain('Authentication error');
      unauthenticatedSocket.disconnect();
      done();
    });
  });

  it('should authenticate connection, join conversation, and receive real-time message', (done) => {
    // Seed conversation with membership
    chatStore.conversations.push({
      id: 'conv_socket_1',
      type: 'DIRECT',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    chatStore.members.push({
      id: 'mem_1',
      conversationId: 'conv_socket_1',
      userId: 'usr_socket_tester',
      role: 'MEMBER',
      joinedAt: new Date()
    });

    clientSocket = Client(`http://localhost:${port}`, {
      auth: { token: validToken },
      transports: ['websocket']
    });

    clientSocket.on('connect', () => {
      clientSocket.emit('conversation:join', { conversationId: 'conv_socket_1' });

      // Listen for message
      clientSocket.on('message:new', (msg) => {
        expect(msg.content).toBe('Real-time greeting!');
        expect(msg.senderId).toBe('usr_socket_tester');
        done();
      });

      // Send message
      clientSocket.emit('message:send', {
        conversationId: 'conv_socket_1',
        content: 'Real-time greeting!'
      });
    });
  });
});
