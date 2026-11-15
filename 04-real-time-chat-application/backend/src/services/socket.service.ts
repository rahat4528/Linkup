import { Server as SocketIOServer, Socket } from 'socket.io';
const jwt = require('jsonwebtoken');
import { config } from '../config';
import { chatStore, ChatMessage } from './store.service';
import { PresenceService } from './presence.service';
import { ReceiptService } from './receipt.service';

export interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export class SocketService {
  private static io: SocketIOServer | null = null;

  public static initialize(io: SocketIOServer) {
    this.io = io;

    // Authentication middleware
    io.use((socket: AuthenticatedSocket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }

      try {
        const decoded = jwt.verify(token, config.jwtSecret) as { id: string; username: string; email: string };
        socket.user = decoded;
        next();
      } catch (err) {
        next(new Error('Authentication error: Invalid token'));
      }
    });

    io.on('connection', (socket: AuthenticatedSocket) => {
      const userId = socket.user!.id;

      // Mark online and join personal room
      PresenceService.setOnline(userId);
      socket.join(`user:${userId}`);

      // Broadcast presence
      socket.broadcast.emit('presence:update', { userId, status: 'ONLINE' });

      // Handle joining conversation rooms
      socket.on('conversation:join', ({ conversationId }: { conversationId: string }) => {
        const isMember = chatStore.members.some(
          m => m.conversationId === conversationId && m.userId === userId
        );
        if (isMember) {
          socket.join(`conv:${conversationId}`);
        }
      });

      // Handle sending real-time messages
      socket.on('message:send', ({ conversationId, content, clientMessageId }: {
        conversationId: string;
        content: string;
        clientMessageId?: string;
      }) => {
        const isMember = chatStore.members.some(
          m => m.conversationId === conversationId && m.userId === userId
        );
        if (!isMember || !content || content.trim().length === 0) return;

        const messageId = 'msg_' + Math.random().toString(36).substring(2, 9);
        const message: ChatMessage = {
          id: messageId,
          conversationId,
          senderId: userId,
          content: content.trim(),
          isDeleted: false,
          isEdited: false,
          clientMessageId,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        chatStore.messages.push(message);

        // Initialize receipts for all other members
        const otherMembers = chatStore.members.filter(
          m => m.conversationId === conversationId && m.userId !== userId
        );
        for (const m of otherMembers) {
          ReceiptService.initReceipt(messageId, m.userId);
        }

        // Broadcast to conversation room
        io.to(`conv:${conversationId}`).emit('message:new', {
          ...message,
          receiptStatus: 'SENT'
        });
      });

      // Handle message delivery receipt
      socket.on('message:delivered', ({ messageId, conversationId }: { messageId: string; conversationId: string }) => {
        ReceiptService.updateStatus(messageId, userId, 'DELIVERED');
        io.to(`conv:${conversationId}`).emit('receipt:update', {
          messageId,
          userId,
          status: 'DELIVERED'
        });
      });

      // Handle message read receipt
      socket.on('message:read', ({ messageId, conversationId }: { messageId: string; conversationId: string }) => {
        ReceiptService.updateStatus(messageId, userId, 'READ');
        io.to(`conv:${conversationId}`).emit('receipt:update', {
          messageId,
          userId,
          status: 'READ'
        });
      });

      // Typing start
      socket.on('typing:start', ({ conversationId }: { conversationId: string }) => {
        PresenceService.setTyping(conversationId, userId, true);
        socket.to(`conv:${conversationId}`).emit('typing:update', {
          conversationId,
          userId,
          isTyping: true
        });
      });

      // Typing stop
      socket.on('typing:stop', ({ conversationId }: { conversationId: string }) => {
        PresenceService.setTyping(conversationId, userId, false);
        socket.to(`conv:${conversationId}`).emit('typing:update', {
          conversationId,
          userId,
          isTyping: false
        });
      });

      // Disconnect
      socket.on('disconnect', () => {
        PresenceService.setOffline(userId);
        socket.broadcast.emit('presence:update', { userId, status: 'OFFLINE' });
      });
    });
  }

  public static getIO(): SocketIOServer | null {
    return this.io;
  }
}
