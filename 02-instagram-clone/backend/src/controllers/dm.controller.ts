import { Response } from 'express';
import { AuthenticatedInstaRequest } from '../middleware/auth.middleware';
import { instaStore, InstaDirectMessage } from '../services/store.service';
import { PrivacyService } from '../services/privacy.service';

export class DmController {
  static sendMessage(req: AuthenticatedInstaRequest, res: Response): void {
    const senderId = req.user!.id;
    const { recipientId, content } = req.body;

    if (!recipientId || !content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({ error: 'Recipient ID and message content are required' });
      return;
    }

    if (PrivacyService.isBlocked(senderId, recipientId)) {
      res.status(403).json({ error: 'Communication blocked by safety settings' });
      return;
    }

    const message: InstaDirectMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      senderId,
      recipientId,
      content: content.trim(),
      isRead: false,
      createdAt: new Date(),
    };
    instaStore.messages.push(message);

    res.status(201).json({ message });
  }

  static getConversation(req: AuthenticatedInstaRequest, res: Response): void {
    const currentUserId = req.user!.id;
    const partnerId = req.params.partnerId as string;

    const conversation = instaStore.messages
      .filter(
        (m) =>
          (m.senderId === currentUserId && m.recipientId === partnerId) ||
          (m.senderId === partnerId && m.recipientId === currentUserId)
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    res.status(200).json({ messages: conversation });
  }
}
