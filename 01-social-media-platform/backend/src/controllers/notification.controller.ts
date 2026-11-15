import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { memoryStore } from '../services/store.service';
import { VisibilityService } from '../services/visibility.service';

export class NotificationController {
  static getNotifications(req: AuthenticatedRequest, res: Response): void {
    const userId = req.user!.id;

    const notifications = memoryStore.notifications
      .filter((n) => n.userId === userId && !VisibilityService.isBlocked(userId, n.actorId))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    res.status(200).json({ notifications });
  }

  static markAsRead(req: AuthenticatedRequest, res: Response): void {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const notif = memoryStore.notifications.find((n) => n.id === id && n.userId === userId);
    if (!notif) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    notif.isRead = true;
    res.status(200).json({ notification: notif });
  }

  static markAllAsRead(req: AuthenticatedRequest, res: Response): void {
    const userId = req.user!.id;
    for (const n of memoryStore.notifications) {
      if (n.userId === userId) {
        n.isRead = true;
      }
    }
    res.status(200).json({ message: 'All notifications marked as read' });
  }
}
