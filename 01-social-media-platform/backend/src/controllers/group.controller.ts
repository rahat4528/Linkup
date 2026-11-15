import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { memoryStore, StoredGroup, StoredGroupMember } from '../services/store.service';
import { VisibilityService } from '../services/visibility.service';

export class GroupController {
  static createGroup(req: AuthenticatedRequest, res: Response): void {
    const creatorId = req.user!.id;
    const { name, description, bannerUrl, privacy = 'PUBLIC' } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Group name is required' });
      return;
    }

    const groupId = `grp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const group: StoredGroup = {
      id: groupId,
      name: name.trim(),
      description,
      bannerUrl,
      privacy,
      creatorId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.groups.push(group);

    // Automatically add creator as OWNER
    const membership: StoredGroupMember = {
      id: `gm_${Date.now()}`,
      groupId,
      userId: creatorId,
      role: 'OWNER',
      joinedAt: new Date(),
    };
    memoryStore.groupMembers.push(membership);

    res.status(201).json({ group, membership });
  }

  static getGroups(req: AuthenticatedRequest, res: Response): void {
    const viewerId = req.user ? req.user.id : null;

    const list = memoryStore.groups.map((g) => {
      const isMember = viewerId ? VisibilityService.isGroupMember(viewerId, g.id) : false;
      const memberCount = memoryStore.groupMembers.filter((m) => m.groupId === g.id).length;
      return {
        id: g.id,
        name: g.name,
        description: g.description,
        privacy: g.privacy,
        bannerUrl: g.bannerUrl,
        memberCount,
        isMember,
      };
    });

    res.status(200).json({ groups: list });
  }

  static getGroupById(req: AuthenticatedRequest, res: Response): void {
    const viewerId = req.user ? req.user.id : null;
    const id = req.params.id as string;

    const group = memoryStore.groups.find((g) => g.id === id);
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    const isMember = viewerId ? VisibilityService.isGroupMember(viewerId, group.id) : false;

    if (group.privacy === 'PRIVATE' && !isMember) {
      res.status(403).json({
        error: 'Private group: Membership required to view full details',
        group: { id: group.id, name: group.name, privacy: group.privacy },
      });
      return;
    }

    const members = memoryStore.groupMembers
      .filter((m) => m.groupId === group.id)
      .map((m) => {
        const u = memoryStore.users.find((user) => user.id === m.userId);
        return {
          userId: m.userId,
          name: u ? u.name : 'Unknown',
          role: m.role,
          joinedAt: m.joinedAt,
        };
      });

    res.status(200).json({ group, members, isMember });
  }

  static joinGroup(req: AuthenticatedRequest, res: Response): void {
    const userId = req.user!.id;
    const groupId = req.params.id as string;

    const group = memoryStore.groups.find((g) => g.id === groupId);
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    const existingMember = memoryStore.groupMembers.find(
      (m) => m.groupId === groupId && m.userId === userId
    );
    if (existingMember) {
      res.status(200).json({ message: 'Already a member', membership: existingMember });
      return;
    }

    const membership: StoredGroupMember = {
      id: `gm_${Date.now()}`,
      groupId,
      userId,
      role: 'MEMBER',
      joinedAt: new Date(),
    };
    memoryStore.groupMembers.push(membership);

    res.status(200).json({ message: 'Joined group successfully', membership });
  }

  static leaveGroup(req: AuthenticatedRequest, res: Response): void {
    const userId = req.user!.id;
    const groupId = req.params.id as string;

    const memberIndex = memoryStore.groupMembers.findIndex(
      (m) => m.groupId === groupId && m.userId === userId
    );
    if (memberIndex === -1) {
      res.status(400).json({ error: 'Not a member of this group' });
      return;
    }

    const membership = memoryStore.groupMembers[memberIndex];
    if (membership.role === 'OWNER') {
      res.status(400).json({ error: 'Group owner must transfer ownership before leaving' });
      return;
    }

    memoryStore.groupMembers.splice(memberIndex, 1);
    res.status(200).json({ message: 'Left group successfully' });
  }
}
