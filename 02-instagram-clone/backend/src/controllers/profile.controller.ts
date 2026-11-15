import { Response } from 'express';
import { AuthenticatedInstaRequest } from '../middleware/auth.middleware';
import { instaStore } from '../services/store.service';
import { PrivacyService } from '../services/privacy.service';

export class ProfileController {
  static getProfileByUsername(req: AuthenticatedInstaRequest, res: Response): void {
    const viewerId = req.user ? req.user.id : null;
    const username = req.params.username as string;

    const user = instaStore.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
    if (!user) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    if (viewerId && PrivacyService.isBlocked(viewerId, user.id)) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    const profile = instaStore.profiles.find((p) => p.userId === user.id);
    const followersCount = instaStore.follows.filter((f) => f.followingId === user.id).length;
    const followingCount = instaStore.follows.filter((f) => f.followerId === user.id).length;
    const isFollowing = viewerId ? PrivacyService.isFollowing(viewerId, user.id) : false;

    const canView = PrivacyService.canViewContent(viewerId, user.id);

    const posts = canView
      ? instaStore.posts
          .filter((p) => p.authorId === user.id && p.status === 'READY')
          .map((p) => ({
            id: p.id,
            caption: p.caption,
            media: p.media,
            likesCount: instaStore.reactions.filter((r) => r.postId === p.id).length,
            commentsCount: instaStore.comments.filter((c) => c.postId === p.id).length,
          }))
      : [];

    res.status(200).json({
      user: { id: user.id, username: user.username, name: user.name },
      profile,
      stats: {
        postsCount: instaStore.posts.filter((p) => p.authorId === user.id && p.status === 'READY').length,
        followersCount,
        followingCount,
      },
      relationship: {
        isFollowing,
        isSelf: viewerId === user.id,
        isLocked: !canView,
      },
      posts,
    });
  }

  static updateProfile(req: AuthenticatedInstaRequest, res: Response): void {
    const userId = req.user!.id;
    let profile = instaStore.profiles.find((p) => p.userId === userId);
    if (!profile) {
      profile = { id: `prof_${userId}`, userId, isPrivate: false, isVerified: false };
      instaStore.profiles.push(profile);
    }

    const { bio, avatarUrl, website, isPrivate } = req.body;
    if (bio !== undefined) profile.bio = bio;
    if (avatarUrl !== undefined) profile.avatarUrl = avatarUrl;
    if (website !== undefined) profile.website = website;
    if (isPrivate !== undefined) profile.isPrivate = isPrivate;

    res.status(200).json({ profile });
  }

  static follow(req: AuthenticatedInstaRequest, res: Response): void {
    try {
      const followerId = req.user!.id;
      const targetUserId = req.params.id as string;

      const result = PrivacyService.followUser(followerId, targetUserId);
      res.status(result.status === 'ACCEPTED' ? 200 : 201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static unfollow(req: AuthenticatedInstaRequest, res: Response): void {
    const followerId = req.user!.id;
    const targetUserId = req.params.id as string;

    instaStore.follows = instaStore.follows.filter(
      (f) => !(f.followerId === followerId && f.followingId === targetUserId)
    );

    res.status(200).json({ message: 'Unfollowed successfully' });
  }

  static approveFollowRequest(req: AuthenticatedInstaRequest, res: Response): void {
    try {
      const receiverId = req.user!.id;
      const requestId = req.params.requestId as string;
      const follow = PrivacyService.approveFollowRequest(requestId, receiverId);
      res.status(200).json({ message: 'Follow request approved', follow });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static rejectFollowRequest(req: AuthenticatedInstaRequest, res: Response): void {
    try {
      const receiverId = req.user!.id;
      const requestId = req.params.requestId as string;
      PrivacyService.rejectFollowRequest(requestId, receiverId);
      res.status(200).json({ message: 'Follow request rejected' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
