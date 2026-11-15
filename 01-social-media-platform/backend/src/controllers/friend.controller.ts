import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { FriendshipService } from '../services/friendship.service';
import { memoryStore, StoredFollow } from '../services/store.service';
import { SocketService } from '../services/socket.service';

export class FriendController {
  static sendRequest(req: AuthenticatedRequest, res: Response): void {
    try {
      const senderId = req.user!.id;
      const targetUserId = req.params.targetUserId as string;

      const result = FriendshipService.sendFriendRequest(senderId, targetUserId);

      // Trigger notification if request was created
      if (result.status === 'REQUESTED' && result.request) {
        SocketService.sendNotification({
          id: `notif_${Date.now()}`,
          userId: targetUserId,
          actorId: senderId,
          type: 'FRIEND_REQUEST',
          title: 'New Friend Request',
          message: `${req.user!.name} sent you a friend request.`,
          isRead: false,
          createdAt: new Date(),
        });
      } else if (result.status === 'ACCEPTED') {
        SocketService.sendNotification({
          id: `notif_${Date.now()}`,
          userId: targetUserId,
          actorId: senderId,
          type: 'FRIEND_ACCEPTED',
          title: 'Friend Connection Formed',
          message: `You and ${req.user!.name} are now friends!`,
          isRead: false,
          createdAt: new Date(),
        });
      }

      res.status(result.status === 'ACCEPTED' ? 200 : 201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static acceptRequest(req: AuthenticatedRequest, res: Response): void {
    try {
      const receiverId = req.user!.id;
      const requestId = req.params.requestId as string;

      const friendship = FriendshipService.acceptFriendRequest(requestId, receiverId);

      const request = memoryStore.friendRequests.find((r) => r.id === requestId);
      if (request) {
        SocketService.sendNotification({
          id: `notif_${Date.now()}`,
          userId: request.senderId,
          actorId: receiverId,
          type: 'FRIEND_ACCEPTED',
          title: 'Friend Request Accepted',
          message: `${req.user!.name} accepted your friend request.`,
          isRead: false,
          createdAt: new Date(),
        });
      }

      res.status(200).json({ message: 'Friend request accepted', friendship });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static rejectRequest(req: AuthenticatedRequest, res: Response): void {
    try {
      const receiverId = req.user!.id;
      const requestId = req.params.requestId as string;
      FriendshipService.rejectFriendRequest(requestId, receiverId);
      res.status(200).json({ message: 'Friend request rejected' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static cancelRequest(req: AuthenticatedRequest, res: Response): void {
    try {
      const senderId = req.user!.id;
      const requestId = req.params.requestId as string;
      FriendshipService.cancelFriendRequest(requestId, senderId);
      res.status(200).json({ message: 'Friend request cancelled' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static unfriend(req: AuthenticatedRequest, res: Response): void {
    try {
      const userId = req.user!.id;
      const targetUserId = req.params.targetUserId as string;
      FriendshipService.unfriend(userId, targetUserId);
      res.status(200).json({ message: 'Unfriended successfully' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static getFriends(req: AuthenticatedRequest, res: Response): void {
    const userId = req.user!.id;
    const friendIds = FriendshipService.getFriendIds(userId);
    const friends = memoryStore.users
      .filter((u) => friendIds.includes(u.id))
      .map((u) => ({
        id: u.id,
        name: u.name,
        username: u.username,
      }));
    res.status(200).json({ friends });
  }

  static getMutualFriends(req: AuthenticatedRequest, res: Response): void {
    const userId = req.user!.id;
    const targetUserId = req.params.targetUserId as string;
    const mutualIds = FriendshipService.getMutualFriendIds(userId, targetUserId);
    const mutuals = memoryStore.users
      .filter((u) => mutualIds.includes(u.id))
      .map((u) => ({
        id: u.id,
        name: u.name,
        username: u.username,
      }));
    res.status(200).json({ mutualFriends: mutuals, count: mutuals.length });
  }

  static getSuggestions(req: AuthenticatedRequest, res: Response): void {
    const userId = req.user!.id;
    const suggestions = FriendshipService.getRecommendations(userId, 5);
    const results = suggestions.map((s) => {
      const user = memoryStore.users.find((u) => u.id === s.userId);
      return {
        user: user ? { id: user.id, name: user.name, username: user.username } : null,
        mutualCount: s.mutualCount,
      };
    }).filter((r) => r.user !== null);

    res.status(200).json({ suggestions: results });
  }

  static follow(req: AuthenticatedRequest, res: Response): void {
    const followerId = req.user!.id;
    const targetUserId = req.params.targetUserId as string;

    if (followerId === targetUserId) {
      res.status(400).json({ error: 'Cannot follow yourself' });
      return;
    }

    const existing = memoryStore.follows.find(
      (f) => f.followerId === followerId && f.followingId === targetUserId
    );
    if (existing) {
      res.status(200).json({ message: 'Already following' });
      return;
    }

    const follow: StoredFollow = {
      id: `fl_${Date.now()}`,
      followerId,
      followingId: targetUserId,
      createdAt: new Date(),
    };
    memoryStore.follows.push(follow);

    res.status(201).json({ message: 'Followed successfully', follow });
  }

  static unfollow(req: AuthenticatedRequest, res: Response): void {
    const followerId = req.user!.id;
    const targetUserId = req.params.targetUserId as string;

    memoryStore.follows = memoryStore.follows.filter(
      (f) => !(f.followerId === followerId && f.followingId === targetUserId)
    );

    res.status(200).json({ message: 'Unfollowed successfully' });
  }
}
