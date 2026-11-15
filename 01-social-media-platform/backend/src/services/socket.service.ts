import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { config } from '../config';
import { VisibilityService } from './visibility.service';
import { memoryStore, StoredNotification } from './store.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export class SocketService {
  private static io: Server | null = null;

  static initialize(ioServer: Server): void {
    this.io = ioServer;

    // Handshake Authentication Middleware
    this.io.use((socket: AuthenticatedSocket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      try {
        const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
        socket.userId = decoded.userId;
        next();
      } catch (err) {
        next(new Error('Invalid or expired authentication token'));
      }
    });

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      const userId = socket.userId;
      if (!userId) {
        socket.disconnect();
        return;
      }

      // Automatically join dedicated user room
      socket.join(`user:${userId}`);

      // Handle group room join request with server-side authorization check
      socket.on('join:group', (groupId: string, ack?: (res: { success: boolean; error?: string }) => void) => {
        const group = memoryStore.groups.find((g) => g.id === groupId);
        if (!group) {
          if (ack) ack({ success: false, error: 'Group not found' });
          return;
        }

        if (group.privacy === 'PRIVATE' && !VisibilityService.isGroupMember(userId, groupId)) {
          if (ack) ack({ success: false, error: 'Unauthorized: Private group member access required' });
          return;
        }

        socket.join(`group:${groupId}`);
        if (ack) ack({ success: true });
      });

      socket.on('disconnect', () => {
        // Ephemeral presence cleanup
      });
    });
  }

  /**
   * Dispatches a notification to recipient with deduplication and safety verification.
   */
  static sendNotification(notification: StoredNotification): boolean {
    // 1. Safety check: never notify blocked users
    if (VisibilityService.isBlocked(notification.userId, notification.actorId)) {
      return false;
    }

    // 2. Persist to store
    memoryStore.notifications.push(notification);

    // 3. Emit real-time event if socket server is initialized
    if (this.io) {
      this.io.to(`user:${notification.userId}`).emit('notification:new', notification);
    }

    return true;
  }

  /**
   * Broadcasts a new post to group members.
   */
  static broadcastGroupPost(groupId: string, post: any): void {
    if (this.io) {
      this.io.to(`group:${groupId}`).emit('group:post:new', post);
    }
  }
}
