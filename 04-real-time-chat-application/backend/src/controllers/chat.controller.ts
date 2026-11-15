import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { chatStore, ChatConversation, ChatMember } from '../services/store.service';
import { GroupService } from '../services/group.service';
import { ReceiptService } from '../services/receipt.service';

export class ChatController {
  public static async listConversations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      // Find all memberships
      const memberships = chatStore.members.filter(m => m.userId === userId);
      const conversationIds = memberships.map(m => m.conversationId);

      const conversations = chatStore.conversations
        .filter(c => conversationIds.includes(c.id))
        .map(conv => {
          const members = chatStore.members
            .filter(m => m.conversationId === conv.id)
            .map(m => {
              const u = chatStore.users.find(user => user.id === m.userId);
              return {
                userId: m.userId,
                role: m.role,
                name: u?.name || 'Unknown',
                username: u?.username || 'unknown',
                avatarUrl: u?.avatarUrl
              };
            });

          const lastMessage = chatStore.messages
            .filter(msg => msg.conversationId === conv.id)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

          // Compute unread count
          const myMembership = memberships.find(m => m.conversationId === conv.id);
          const lastReadTime = myMembership?.lastReadAt?.getTime() || 0;
          const unreadCount = chatStore.messages.filter(
            msg => msg.conversationId === conv.id &&
                   msg.senderId !== userId &&
                   msg.createdAt.getTime() > lastReadTime
          ).length;

          return {
            id: conv.id,
            type: conv.type,
            title: conv.title,
            avatarUrl: conv.avatarUrl,
            members,
            lastMessage: lastMessage ? {
              id: lastMessage.id,
              senderId: lastMessage.senderId,
              content: lastMessage.isDeleted ? 'This message was deleted' : lastMessage.content,
              createdAt: lastMessage.createdAt
            } : null,
            unreadCount
          };
        })
        .sort((a, b) => {
          const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
          const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
          return timeB - timeA;
        });

      res.status(200).json({ conversations });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async getOrCreateDirect(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUserId = req.user!.id;
      const { targetUserId } = req.body;

      if (!targetUserId) {
        res.status(400).json({ error: 'targetUserId is required' });
        return;
      }

      if (targetUserId === currentUserId) {
        res.status(400).json({ error: 'Cannot create a direct conversation with yourself' });
        return;
      }

      const targetUser = chatStore.users.find(u => u.id === targetUserId);
      if (!targetUser) {
        res.status(404).json({ error: 'Target user not found' });
        return;
      }

      // Check if direct conversation already exists between these 2 users
      const directConversations = chatStore.conversations.filter(c => c.type === 'DIRECT');
      for (const conv of directConversations) {
        const memberIds = chatStore.members
          .filter(m => m.conversationId === conv.id)
          .map(m => m.userId);

        if (memberIds.length === 2 && memberIds.includes(currentUserId) && memberIds.includes(targetUserId)) {
          res.status(200).json({ conversation: conv });
          return;
        }
      }

      // Create new direct conversation
      const convId = 'conv_' + Math.random().toString(36).substring(2, 9);
      const conversation: ChatConversation = {
        id: convId,
        type: 'DIRECT',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      chatStore.conversations.push(conversation);
      chatStore.members.push(
        {
          id: 'mem_' + Math.random().toString(36).substring(2, 9),
          conversationId: convId,
          userId: currentUserId,
          role: 'MEMBER',
          joinedAt: new Date()
        },
        {
          id: 'mem_' + Math.random().toString(36).substring(2, 9),
          conversationId: convId,
          userId: targetUserId,
          role: 'MEMBER',
          joinedAt: new Date()
        }
      );

      res.status(201).json({ conversation });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async createGroup(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const creatorId = req.user!.id;
      const { title, memberUserIds } = req.body;

      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        res.status(400).json({ error: 'Group title is required' });
        return;
      }

      const group = GroupService.createGroup(creatorId, title, memberUserIds || []);
      res.status(201).json({ conversation: group });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async getMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const conversationId = req.params.id as string;
      const userId = req.user!.id;
      const since = req.query.since ? new Date(req.query.since as string) : null;

      // Verify membership
      const isMember = chatStore.members.some(
        m => m.conversationId === conversationId && m.userId === userId
      );
      if (!isMember) {
        res.status(403).json({ error: 'Access denied: You are not a member of this conversation' });
        return;
      }

      let messages = chatStore.messages.filter(m => m.conversationId === conversationId);

      // Support reconnection catch-up with `since`
      if (since && !isNaN(since.getTime())) {
        messages = messages.filter(m => m.createdAt > since);
      }

      messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      // Enrich with receipts and reactions
      const enriched = messages.map(msg => {
        const sender = chatStore.users.find(u => u.id === msg.senderId);
        const reactions = chatStore.reactions
          .filter(r => r.messageId === msg.id)
          .map(r => ({ userId: r.userId, emoji: r.emoji }));

        const receiptStatus = ReceiptService.getMessageStatus(msg.id);

        return {
          id: msg.id,
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          senderName: sender?.name || 'Unknown',
          senderUsername: sender?.username || 'unknown',
          content: msg.isDeleted ? 'This message was deleted' : msg.content,
          isDeleted: msg.isDeleted,
          isEdited: msg.isEdited,
          clientMessageId: msg.clientMessageId,
          createdAt: msg.createdAt,
          receiptStatus,
          reactions
        };
      });

      // Mark user's last read time
      const member = chatStore.members.find(
        m => m.conversationId === conversationId && m.userId === userId
      );
      if (member) {
        member.lastReadAt = new Date();
      }

      res.status(200).json({ messages: enriched });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
}
