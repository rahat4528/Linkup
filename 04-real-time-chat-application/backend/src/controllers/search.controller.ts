import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { chatStore } from '../services/store.service';
import { PresenceService } from '../services/presence.service';

export class SearchController {
  public static async searchMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const query = ((req.query.q as string) || '').trim().toLowerCase();

      if (!query) {
        res.status(200).json({ messages: [] });
        return;
      }

      // Find all conversations user is part of
      const userConvIds = chatStore.members
        .filter(m => m.userId === userId)
        .map(m => m.conversationId);

      const matched = chatStore.messages
        .filter(m =>
          userConvIds.includes(m.conversationId) &&
          !m.isDeleted &&
          m.content.toLowerCase().includes(query)
        )
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map(msg => {
          const sender = chatStore.users.find(u => u.id === msg.senderId);
          const conv = chatStore.conversations.find(c => c.id === msg.conversationId);
          return {
            id: msg.id,
            conversationId: msg.conversationId,
            conversationTitle: conv?.title || (conv?.type === 'DIRECT' ? 'Direct Message' : 'Group'),
            senderId: msg.senderId,
            senderName: sender?.name || 'Unknown',
            content: msg.content,
            createdAt: msg.createdAt
          };
        });

      res.status(200).json({ query, count: matched.length, messages: matched });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async searchUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUserId = req.user!.id;
      const query = ((req.query.q as string) || '').trim().toLowerCase();

      const users = chatStore.users
        .filter(u =>
          u.id !== currentUserId &&
          (u.username.toLowerCase().includes(query) || u.name.toLowerCase().includes(query))
        )
        .map(u => ({
          id: u.id,
          username: u.username,
          name: u.name,
          presence: PresenceService.getPresence(u.id)
        }));

      res.status(200).json({ users });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async getPresence(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const targetUserId = req.params.userId as string;
      const status = PresenceService.getPresence(targetUserId);
      res.status(200).json({ userId: targetUserId, status });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
}
