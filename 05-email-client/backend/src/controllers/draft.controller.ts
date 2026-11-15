import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { DraftService } from '../services/draft.service';
import { emailStore } from '../services/store.service';

export class DraftController {
  public static async autosaveDraft(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { draftId, to, cc, bcc, subject, bodyText, bodyHtml, inReplyTo, references } = req.body;

      const result = DraftService.autosave(userId, {
        draftId,
        to,
        cc,
        bcc,
        subject,
        bodyText,
        bodyHtml,
        inReplyTo,
        references
      });

      res.status(200).json({
        message: 'Draft autosaved',
        draft: result.draft,
        thread: result.thread
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async getDraft(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const draftId = req.params.id as string;
      const draft = emailStore.messages.find(m => m.id === draftId && m.isDraft);

      if (!draft) {
        res.status(404).json({ error: 'Draft not found' });
        return;
      }

      res.status(200).json({ draft });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async discardDraft(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const draftId = req.params.id as string;
      const userId = req.user!.id;

      const success = DraftService.discardDraft(userId, draftId);
      if (success) {
        res.status(200).json({ message: 'Draft discarded' });
      } else {
        res.status(404).json({ error: 'Draft not found' });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
}
