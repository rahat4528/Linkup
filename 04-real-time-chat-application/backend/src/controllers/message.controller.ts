import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { chatStore, ChatMessage, ChatReaction } from '../services/store.service';
import { ReceiptService } from '../services/receipt.service';
import { GroupService } from '../services/group.service';

export class MessageController {
  public static async sendMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const conversationId = req.params.conversationId as string;
      const senderId = req.user!.id;
      const { content, clientMessageId } = req.body;

      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        res.status(400).json({ error: 'Message content is required' });
        return;
      }

      // Check membership
      const isMember = chatStore.members.some(
        m => m.conversationId === conversationId && m.userId === senderId
      );
      if (!isMember) {
        res.status(403).json({ error: 'Access denied: You are not a member of this conversation' });
        return;
      }

      const messageId = 'msg_' + Math.random().toString(36).substring(2, 9);
      const message: ChatMessage = {
        id: messageId,
        conversationId,
        senderId,
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
        m => m.conversationId === conversationId && m.userId !== senderId
      );
      for (const m of otherMembers) {
        ReceiptService.initReceipt(messageId, m.userId);
      }

      res.status(201).json({ message });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async editMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const messageId = req.params.id as string;
      const userId = req.user!.id;
      const { content } = req.body;

      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        res.status(400).json({ error: 'Content is required' });
        return;
      }

      const message = chatStore.messages.find(m => m.id === messageId);
      if (!message) {
        res.status(404).json({ error: 'Message not found' });
        return;
      }

      if (message.senderId !== userId) {
        res.status(403).json({ error: 'Only the author can edit this message' });
        return;
      }

      if (message.isDeleted) {
        res.status(400).json({ error: 'Cannot edit a deleted message' });
        return;
      }

      message.content = content.trim();
      message.isEdited = true;
      message.updatedAt = new Date();

      res.status(200).json({ message });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async deleteMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const messageId = req.params.id as string;
      const userId = req.user!.id;

      const message = chatStore.messages.find(m => m.id === messageId);
      if (!message) {
        res.status(404).json({ error: 'Message not found' });
        return;
      }

      const isAuthor = message.senderId === userId;
      const isGroupAdmin = GroupService.isManager(message.conversationId, userId);

      if (!isAuthor && !isGroupAdmin) {
        res.status(403).json({ error: 'Unauthorized to delete this message' });
        return;
      }

      message.isDeleted = true;
      message.updatedAt = new Date();

      res.status(200).json({
        message: 'Message deleted',
        tombstone: 'This message was deleted'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async toggleReaction(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const messageId = req.params.id as string;
      const userId = req.user!.id;
      const { emoji } = req.body;

      if (!emoji || typeof emoji !== 'string') {
        res.status(400).json({ error: 'Emoji is required' });
        return;
      }

      const message = chatStore.messages.find(m => m.id === messageId);
      if (!message) {
        res.status(404).json({ error: 'Message not found' });
        return;
      }

      const existingIndex = chatStore.reactions.findIndex(
        r => r.messageId === messageId && r.userId === userId && r.emoji === emoji
      );

      if (existingIndex !== -1) {
        chatStore.reactions.splice(existingIndex, 1);
        res.status(200).json({ message: 'Reaction removed', reacted: false });
      } else {
        const reaction: ChatReaction = {
          id: 'rxn_' + Math.random().toString(36).substring(2, 9),
          messageId,
          userId,
          emoji,
          createdAt: new Date()
        };
        chatStore.reactions.push(reaction);
        res.status(201).json({ message: 'Reaction added', reacted: true, reaction });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async markRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const messageId = req.params.id as string;
      const userId = req.user!.id;

      const receipt = ReceiptService.updateStatus(messageId, userId, 'READ');
      res.status(200).json({ receipt });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
}
