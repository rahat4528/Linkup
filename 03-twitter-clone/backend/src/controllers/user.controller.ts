import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { twitterStore, TweetFollow } from '../services/store.service';
import { SafetyService } from '../services/safety.service';

export class UserController {
  public static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const username = req.params.username as string;
      const currentUserId = req.user?.id;

      const user = twitterStore.users.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Check block condition
      if (currentUserId && SafetyService.isBlockedBetween(currentUserId, user.id)) {
        res.status(403).json({ error: 'Access denied: Profile cannot be viewed due to block settings' });
        return;
      }

      const profile = twitterStore.profiles.find(p => p.userId === user.id);
      const followersCount = twitterStore.follows.filter(f => f.followingId === user.id).length;
      const followingCount = twitterStore.follows.filter(f => f.followerId === user.id).length;
      const postsCount = twitterStore.posts.filter(p => p.authorId === user.id && !p.isDeleted).length;

      let isFollowing = false;
      let isMuted = false;
      let isBlocked = false;

      if (currentUserId) {
        isFollowing = twitterStore.follows.some(f => f.followerId === currentUserId && f.followingId === user.id);
        isMuted = SafetyService.isMuted(currentUserId, user.id);
        isBlocked = twitterStore.blocks.some(b => b.blockerId === currentUserId && b.blockedId === user.id);
      }

      res.status(200).json({
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          createdAt: user.createdAt
        },
        profile: profile || {},
        counts: { followers: followersCount, following: followingCount, posts: postsCount },
        relationship: { isFollowing, isMuted, isBlocked }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { bio, location, website, avatarUrl, bannerUrl, pinnedPostId } = req.body;

      let profile = twitterStore.profiles.find(p => p.userId === userId);
      if (!profile) {
        profile = {
          id: 'prof_' + Math.random().toString(36).substring(2, 9),
          userId
        };
        twitterStore.profiles.push(profile);
      }

      if (bio !== undefined) profile.bio = bio;
      if (location !== undefined) profile.location = location;
      if (website !== undefined) profile.website = website;
      if (avatarUrl !== undefined) profile.avatarUrl = avatarUrl;
      if (bannerUrl !== undefined) profile.bannerUrl = bannerUrl;
      if (pinnedPostId !== undefined) {
        if (pinnedPostId !== null) {
          const post = twitterStore.posts.find(p => p.id === pinnedPostId && p.authorId === userId && !p.isDeleted);
          if (!post) {
            res.status(400).json({ error: 'Cannot pin a post that does not exist, belongs to another user, or is deleted' });
            return;
          }
        }
        profile.pinnedPostId = pinnedPostId;
      }

      res.status(200).json({
        message: 'Profile updated successfully',
        profile
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async toggleFollow(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const targetUserId = req.params.id as string;
      const currentUserId = req.user!.id;

      if (targetUserId === currentUserId) {
        res.status(400).json({ error: 'Cannot follow yourself' });
        return;
      }

      if (SafetyService.isBlockedBetween(currentUserId, targetUserId)) {
        res.status(403).json({ error: 'Cannot follow a blocked user or someone who has blocked you' });
        return;
      }

      const existingIndex = twitterStore.follows.findIndex(
        f => f.followerId === currentUserId && f.followingId === targetUserId
      );

      if (existingIndex !== -1) {
        twitterStore.follows.splice(existingIndex, 1);
        res.status(200).json({ message: 'Unfollowed user', following: false });
      } else {
        const follow: TweetFollow = {
          id: 'foll_' + Math.random().toString(36).substring(2, 9),
          followerId: currentUserId,
          followingId: targetUserId,
          createdAt: new Date()
        };
        twitterStore.follows.push(follow);
        res.status(200).json({ message: 'Followed user', following: true });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async muteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const targetUserId = req.params.id as string;
      const currentUserId = req.user!.id;

      SafetyService.muteUser(currentUserId, targetUserId);
      res.status(200).json({ message: 'User muted successfully (silent, follow preserved)' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  public static async unmuteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const targetUserId = req.params.id as string;
      const currentUserId = req.user!.id;

      const success = SafetyService.unmuteUser(currentUserId, targetUserId);
      res.status(200).json({ message: success ? 'User unmuted' : 'User was not muted' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  public static async blockUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const targetUserId = req.params.id as string;
      const currentUserId = req.user!.id;

      SafetyService.blockUser(currentUserId, targetUserId);
      res.status(200).json({ message: 'User blocked (follows severed both directions, interactions revoked)' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  public static async unblockUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const targetUserId = req.params.id as string;
      const currentUserId = req.user!.id;

      const success = SafetyService.unblockUser(currentUserId, targetUserId);
      res.status(200).json({ message: success ? 'User unblocked' : 'User was not blocked' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
