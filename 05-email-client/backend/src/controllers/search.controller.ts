import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { emailStore } from '../services/store.service';

export class SearchController {
  public static async searchEmails(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const query = ((req.query.q as string) || '').trim().toLowerCase();

      if (!query) {
        res.status(200).json({ query, threads: [] });
        return;
      }

      const userThreads = emailStore.threads.filter(t => t.userId === userId);

      // Find matching threads by subject or matching messages inside thread
      const matchedThreads = userThreads.filter(t => {
        // Match subject
        if (t.normalizedSubject.toLowerCase().includes(query)) return true;

        // Match labels
        const labelIds = emailStore.labelAssignments
          .filter(a => a.threadId === t.id)
          .map(a => a.labelId);
        const matchesLabel = emailStore.labels.some(
          l => labelIds.includes(l.id) && l.name.toLowerCase().includes(query)
        );
        if (matchesLabel) return true;

        // Match messages inside thread
        const messages = emailStore.messages.filter(m => m.threadId === t.id);
        return messages.some(m =>
          m.from.toLowerCase().includes(query) ||
          m.to.some(to => to.toLowerCase().includes(query)) ||
          (m.bodyText && m.bodyText.toLowerCase().includes(query)) ||
          (m.bodyHtml && m.bodyHtml.toLowerCase().includes(query))
        );
      });

      // Enrich
      const enriched = matchedThreads.map(t => {
        const labels = emailStore.labelAssignments
          .filter(a => a.threadId === t.id)
          .map(a => {
            const l = emailStore.labels.find(lbl => lbl.id === a.labelId);
            return l ? { id: l.id, name: l.name, color: l.color } : null;
          })
          .filter(Boolean);

        return {
          id: t.id,
          normalizedSubject: t.normalizedSubject,
          snippet: t.snippet,
          folder: t.folder,
          isStarred: t.isStarred,
          isRead: t.isRead,
          lastMessageAt: t.lastMessageAt,
          labels
        };
      });

      res.status(200).json({ query, count: enriched.length, threads: enriched });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
}
