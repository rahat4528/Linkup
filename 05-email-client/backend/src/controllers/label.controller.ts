import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { emailStore, EmailLabel, EmailLabelAssignment } from '../services/store.service';

export class LabelController {
  public static async listLabels(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const labels = emailStore.labels.filter(l => l.userId === userId);
      res.status(200).json({ labels });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async createLabel(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { name, color } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json({ error: 'Label name is required' });
        return;
      }

      const existing = emailStore.labels.find(
        l => l.userId === userId && l.name.toLowerCase() === name.trim().toLowerCase()
      );
      if (existing) {
        res.status(409).json({ error: 'Label with this name already exists' });
        return;
      }

      const label: EmailLabel = {
        id: 'lbl_' + Math.random().toString(36).substring(2, 9),
        userId,
        name: name.trim(),
        color: color || '#3b82f6',
        createdAt: new Date()
      };
      emailStore.labels.push(label);

      res.status(201).json({ label });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async assignLabel(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const threadId = req.params.id as string;
      const userId = req.user!.id;
      const { labelId } = req.body;

      if (!labelId) {
        res.status(400).json({ error: 'labelId is required' });
        return;
      }

      const thread = emailStore.threads.find(t => t.id === threadId && t.userId === userId);
      if (!thread) {
        res.status(404).json({ error: 'Thread not found' });
        return;
      }

      const label = emailStore.labels.find(l => l.id === labelId && l.userId === userId);
      if (!label) {
        res.status(404).json({ error: 'Label not found' });
        return;
      }

      const existing = emailStore.labelAssignments.find(
        a => a.threadId === threadId && a.labelId === labelId
      );
      if (!existing) {
        const assignment: EmailLabelAssignment = {
          id: 'asgn_' + Math.random().toString(36).substring(2, 9),
          threadId,
          labelId
        };
        emailStore.labelAssignments.push(assignment);
      }

      res.status(200).json({ message: 'Label assigned' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async removeLabel(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const threadId = req.params.id as string;
      const labelId = req.params.labelId as string;
      const userId = req.user!.id;

      const thread = emailStore.threads.find(t => t.id === threadId && t.userId === userId);
      if (!thread) {
        res.status(404).json({ error: 'Thread not found' });
        return;
      }

      const idx = emailStore.labelAssignments.findIndex(
        a => a.threadId === threadId && a.labelId === labelId
      );
      if (idx !== -1) {
        emailStore.labelAssignments.splice(idx, 1);
        res.status(200).json({ message: 'Label removed' });
      } else {
        res.status(404).json({ error: 'Assignment not found' });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
}
