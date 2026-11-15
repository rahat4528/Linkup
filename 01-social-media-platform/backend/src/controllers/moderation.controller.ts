import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { memoryStore, StoredBlock, StoredReport } from '../services/store.service';

export class ModerationController {
  static blockUser(req: AuthenticatedRequest, res: Response): void {
    const blockerId = req.user!.id;
    const targetUserId = req.params.targetUserId as string;

    if (blockerId === targetUserId) {
      res.status(400).json({ error: 'Cannot block yourself' });
      return;
    }

    // Add block record if not existing
    const existing = memoryStore.blocks.find(
      (b) => b.blockerId === blockerId && b.blockedId === targetUserId
    );
    if (!existing) {
      const block: StoredBlock = {
        id: `blk_${Date.now()}`,
        blockerId,
        blockedId: targetUserId,
        createdAt: new Date(),
      };
      memoryStore.blocks.push(block);
    }

    // Two-way cleanup: purge friendships, requests, and follows between the pair
    memoryStore.friendships = memoryStore.friendships.filter(
      (f) =>
        !(
          (f.userAId === blockerId && f.userBId === targetUserId) ||
          (f.userAId === targetUserId && f.userBId === blockerId)
        )
    );

    memoryStore.friendRequests = memoryStore.friendRequests.filter(
      (r) =>
        !(
          (r.senderId === blockerId && r.receiverId === targetUserId) ||
          (r.senderId === targetUserId && r.receiverId === blockerId)
        )
    );

    memoryStore.follows = memoryStore.follows.filter(
      (f) =>
        !(
          (f.followerId === blockerId && f.followingId === targetUserId) ||
          (f.followerId === targetUserId && f.followingId === blockerId)
        )
    );

    // Remove notifications between them
    memoryStore.notifications = memoryStore.notifications.filter(
      (n) =>
        !(
          (n.userId === blockerId && n.actorId === targetUserId) ||
          (n.userId === targetUserId && n.actorId === blockerId)
        )
    );

    res.status(200).json({ message: 'User blocked and connections severed' });
  }

  static unblockUser(req: AuthenticatedRequest, res: Response): void {
    const blockerId = req.user!.id;
    const targetUserId = req.params.targetUserId as string;

    memoryStore.blocks = memoryStore.blocks.filter(
      (b) => !(b.blockerId === blockerId && b.blockedId === targetUserId)
    );

    res.status(200).json({ message: 'User unblocked' });
  }

  static reportContent(req: AuthenticatedRequest, res: Response): void {
    const reporterId = req.user!.id;
    const { targetType, targetId, reason, description } = req.body;

    if (!targetType || !targetId || !reason) {
      res.status(400).json({ error: 'Target type, target ID, and reason are required' });
      return;
    }

    const report: StoredReport = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      reporterId,
      targetType,
      targetId,
      reason,
      description,
      status: 'PENDING',
      createdAt: new Date(),
    };
    memoryStore.reports.push(report);

    res.status(201).json({ message: 'Report submitted to moderation queue', report });
  }

  static getReports(req: AuthenticatedRequest, res: Response): void {
    if (req.user!.role !== 'ADMIN' && req.user!.role !== 'MODERATOR') {
      res.status(403).json({ error: 'Moderator access required' });
      return;
    }

    res.status(200).json({ reports: memoryStore.reports });
  }

  static updateReportStatus(req: AuthenticatedRequest, res: Response): void {
    if (req.user!.role !== 'ADMIN' && req.user!.role !== 'MODERATOR') {
      res.status(403).json({ error: 'Moderator access required' });
      return;
    }

    const id = req.params.id as string;
    const { status } = req.body;

    const report = memoryStore.reports.find((r) => r.id === id);
    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    report.status = status;
    res.status(200).json({ message: 'Report status updated', report });
  }
}
