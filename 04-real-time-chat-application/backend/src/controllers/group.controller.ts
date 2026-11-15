import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { GroupService } from '../services/group.service';
import { chatStore } from '../services/store.service';

export class GroupController {
  public static async addMember(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const conversationId = req.params.id as string;
      const operatorId = req.user!.id;
      const { targetUserId, role } = req.body;

      if (!targetUserId) {
        res.status(400).json({ error: 'targetUserId is required' });
        return;
      }

      const member = GroupService.addMember(conversationId, operatorId, targetUserId, role || 'MEMBER');
      res.status(200).json({ message: 'Member added to group', member });
    } catch (err: any) {
      if (err.message.includes('Unauthorized')) {
        res.status(403).json({ error: err.message });
      } else {
        res.status(400).json({ error: err.message });
      }
    }
  }

  public static async removeMember(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const conversationId = req.params.id as string;
      const targetUserId = req.params.userId as string;
      const operatorId = req.user!.id;

      const success = GroupService.removeMember(conversationId, operatorId, targetUserId);
      if (success) {
        res.status(200).json({ message: 'Member removed from group' });
      } else {
        res.status(404).json({ error: 'Member not found in conversation' });
      }
    } catch (err: any) {
      if (err.message.includes('Unauthorized') || err.message.includes('Forbidden')) {
        res.status(403).json({ error: err.message });
      } else {
        res.status(400).json({ error: err.message });
      }
    }
  }

  public static async updateRole(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const conversationId = req.params.id as string;
      const operatorId = req.user!.id;
      const { targetUserId, role } = req.body;

      if (!targetUserId || !role) {
        res.status(400).json({ error: 'targetUserId and role are required' });
        return;
      }

      const updated = GroupService.updateRole(conversationId, operatorId, targetUserId, role);
      res.status(200).json({ message: 'Member role updated', member: updated });
    } catch (err: any) {
      if (err.message.includes('Unauthorized')) {
        res.status(403).json({ error: err.message });
      } else {
        res.status(400).json({ error: err.message });
      }
    }
  }

  public static async transferOwnership(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const conversationId = req.params.id as string;
      const currentOwnerId = req.user!.id;
      const { newOwnerId } = req.body;

      if (!newOwnerId) {
        res.status(400).json({ error: 'newOwnerId is required' });
        return;
      }

      const updated = GroupService.transferOwnership(conversationId, currentOwnerId, newOwnerId);
      res.status(200).json({ message: 'Ownership transferred successfully', newOwner: updated });
    } catch (err: any) {
      if (err.message.includes('Unauthorized')) {
        res.status(403).json({ error: err.message });
      } else {
        res.status(400).json({ error: err.message });
      }
    }
  }
}
