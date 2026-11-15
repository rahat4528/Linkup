import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { emailStore } from '../services/store.service';

export class ThreadController {
  public static async getThreadMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const threadId = req.params.threadId as string;
      const userId = req.user!.id;

      const thread = emailStore.threads.find(t => t.id === threadId && t.userId === userId);
      if (!thread) {
        res.status(404).json({ error: 'Thread not found' });
        return;
      }

      // Mark thread as read
      thread.isRead = true;
      thread.updatedAt = new Date();

      const messages = emailStore.messages
        .filter(m => m.threadId === threadId)
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      const labels = emailStore.labelAssignments
        .filter(a => a.threadId === thread.id)
        .map(a => {
          const l = emailStore.labels.find(lbl => lbl.id === a.labelId);
          return l ? { id: l.id, name: l.name, color: l.color } : null;
        })
        .filter(Boolean);

      res.status(200).json({
        thread: {
          ...thread,
          labels
        },
        messages
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
}
