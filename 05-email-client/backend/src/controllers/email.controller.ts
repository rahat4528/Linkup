import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { emailStore, EmailFolder } from '../services/store.service';
import { MailService } from '../services/mail.service';

export class EmailController {
  public static async listEmails(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const folder = (req.query.folder as string || 'INBOX').toUpperCase() as EmailFolder | 'STARRED';
      const labelId = req.query.labelId as string;

      let threads = emailStore.threads.filter(t => t.userId === userId);

      if (labelId) {
        const assignedThreadIds = emailStore.labelAssignments
          .filter(a => a.labelId === labelId)
          .map(a => a.threadId);
        threads = threads.filter(t => assignedThreadIds.includes(t.id));
      } else if (folder === 'STARRED') {
        threads = threads.filter(t => t.isStarred && t.folder !== 'TRASH');
      } else {
        threads = threads.filter(t => t.folder === folder);
      }

      // Sort reverse chronological
      threads.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());

      // Enrich with labels and message count
      const enriched = threads.map(t => {
        const messageCount = emailStore.messages.filter(m => m.threadId === t.id && !m.isDraft).length;
        const labels = emailStore.labelAssignments
          .filter(a => a.threadId === t.id)
          .map(a => {
            const l = emailStore.labels.find(lbl => lbl.id === a.labelId);
            return l ? { id: l.id, name: l.name, color: l.color } : null;
          })
          .filter(Boolean);

        const lastMsg = emailStore.messages
          .filter(m => m.threadId === t.id)
          .sort((a, b) => b.date.getTime() - a.date.getTime())[0];

        return {
          id: t.id,
          normalizedSubject: t.normalizedSubject,
          snippet: t.snippet,
          folder: t.folder,
          isStarred: t.isStarred,
          isRead: t.isRead,
          messageCount: Math.max(messageCount, 1),
          lastMessageAt: t.lastMessageAt,
          from: lastMsg?.from || 'Unknown',
          labels
        };
      });

      res.status(200).json({ folder, threads: enriched });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async sendEmail(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const userEmail = req.user!.email;
      const { to, cc, bcc, subject, text, html, inReplyTo, references, draftId } = req.body;

      if (!to || !Array.isArray(to) || to.length === 0) {
        res.status(400).json({ error: 'At least one recipient (to) is required' });
        return;
      }

      const result = await MailService.sendMail(
        userId,
        userEmail,
        {
          from: userEmail,
          to,
          cc,
          bcc,
          subject: subject || '(No Subject)',
          text,
          html,
          inReplyTo,
          references
        },
        draftId
      );

      res.status(201).json({
        message: 'Email sent successfully',
        email: result.message,
        thread: result.thread
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async toggleStar(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const threadId = req.params.id as string;
      const userId = req.user!.id;

      const thread = emailStore.threads.find(t => t.id === threadId && t.userId === userId);
      if (!thread) {
        res.status(404).json({ error: 'Thread not found' });
        return;
      }

      thread.isStarred = !thread.isStarred;
      thread.updatedAt = new Date();

      res.status(200).json({ message: 'Star toggled', isStarred: thread.isStarred });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async toggleRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const threadId = req.params.id as string;
      const userId = req.user!.id;
      const { isRead } = req.body;

      const thread = emailStore.threads.find(t => t.id === threadId && t.userId === userId);
      if (!thread) {
        res.status(404).json({ error: 'Thread not found' });
        return;
      }

      thread.isRead = typeof isRead === 'boolean' ? isRead : !thread.isRead;
      thread.updatedAt = new Date();

      res.status(200).json({ message: 'Read status updated', isRead: thread.isRead });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async moveToFolder(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const threadId = req.params.id as string;
      const userId = req.user!.id;
      const { folder } = req.body;

      const validFolders: EmailFolder[] = ['INBOX', 'SENT', 'DRAFTS', 'TRASH', 'SPAM', 'ARCHIVE'];
      if (!validFolders.includes(folder)) {
        res.status(400).json({ error: 'Invalid folder' });
        return;
      }

      const thread = emailStore.threads.find(t => t.id === threadId && t.userId === userId);
      if (!thread) {
        res.status(404).json({ error: 'Thread not found' });
        return;
      }

      thread.folder = folder;
      thread.updatedAt = new Date();

      res.status(200).json({ message: `Thread moved to ${folder}`, thread });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
}
