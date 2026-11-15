import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { memoryStore } from '../services/store.service';
import { VisibilityService } from '../services/visibility.service';
import { FriendshipService } from '../services/friendship.service';

export class UserController {
  static getMe(req: AuthenticatedRequest, res: Response): void {
    const user = req.user!;
    const profile = memoryStore.profiles.find((p) => p.userId === user.id);
    const friendCount = FriendshipService.getFriendIds(user.id).length;
    const postCount = memoryStore.posts.filter((p) => p.authorId === user.id).length;

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
      profile,
      stats: {
        friendCount,
        postCount,
      },
    });
  }

  static updateProfile(req: AuthenticatedRequest, res: Response): void {
    const user = req.user!;
    let profile = memoryStore.profiles.find((p) => p.userId === user.id);
    if (!profile) {
      profile = {
        id: `p_${user.id}`,
        userId: user.id,
        profilePrivacy: 'PUBLIC',
        allowSearchIndex: true,
      };
      memoryStore.profiles.push(profile);
    }

    const { bio, location, education, work, avatarUrl, coverUrl, profilePrivacy, allowSearchIndex } = req.body;
    if (bio !== undefined) profile.bio = bio;
    if (location !== undefined) profile.location = location;
    if (education !== undefined) profile.education = education;
    if (work !== undefined) profile.work = work;
    if (avatarUrl !== undefined) profile.avatarUrl = avatarUrl;
    if (coverUrl !== undefined) profile.coverUrl = coverUrl;
    if (profilePrivacy !== undefined) profile.profilePrivacy = profilePrivacy;
    if (allowSearchIndex !== undefined) profile.allowSearchIndex = allowSearchIndex;

    res.status(200).json({ profile });
  }

  static getUserById(req: AuthenticatedRequest, res: Response): void {
    const viewerId = req.user ? req.user.id : null;
    const id = req.params.id as string;

    const targetUser = memoryStore.users.find((u) => u.id === id);
    if (!targetUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check privacy boundary
    if (!VisibilityService.canViewProfile(viewerId, targetUser.id)) {
      res.status(403).json({ error: 'This profile is private or unavailable' });
      return;
    }

    const profile = memoryStore.profiles.find((p) => p.userId === targetUser.id);
    const mutualFriends = viewerId ? FriendshipService.getMutualFriendIds(viewerId, targetUser.id) : [];

    res.status(200).json({
      user: {
        id: targetUser.id,
        username: targetUser.username,
        name: targetUser.name,
        createdAt: targetUser.createdAt,
      },
      profile,
      mutualFriendsCount: mutualFriends.length,
    });
  }

  static deleteAccount(req: AuthenticatedRequest, res: Response): void {
    const userId = req.user!.id;

    // Purge user and cascading data
    memoryStore.users = memoryStore.users.filter((u) => u.id !== userId);
    memoryStore.profiles = memoryStore.profiles.filter((p) => p.userId !== userId);
    memoryStore.posts = memoryStore.posts.filter((p) => p.authorId !== userId);
    memoryStore.comments = memoryStore.comments.filter((c) => c.authorId !== userId);
    memoryStore.reactions = memoryStore.reactions.filter((r) => r.userId !== userId);
    memoryStore.friendships = memoryStore.friendships.filter(
      (f) => f.userAId !== userId && f.userBId !== userId
    );
    memoryStore.friendRequests = memoryStore.friendRequests.filter(
      (r) => r.senderId !== userId && r.receiverId !== userId
    );
    memoryStore.follows = memoryStore.follows.filter(
      (f) => f.followerId !== userId && f.followingId !== userId
    );
    memoryStore.blocks = memoryStore.blocks.filter(
      (b) => b.blockerId !== userId && b.blockedId !== userId
    );
    memoryStore.groupMembers = memoryStore.groupMembers.filter((m) => m.userId !== userId);
    memoryStore.stories = memoryStore.stories.filter((s) => s.authorId !== userId);
    memoryStore.notifications = memoryStore.notifications.filter(
      (n) => n.userId !== userId && n.actorId !== userId
    );

    res.status(200).json({ message: 'Account and personal data successfully deleted' });
  }
}
