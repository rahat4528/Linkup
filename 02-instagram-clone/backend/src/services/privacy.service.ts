import { instaStore, InstaFollow, InstaFollowRequest } from './store.service';

export interface FollowActionResult {
  status: 'ACCEPTED' | 'PENDING';
  message: string;
  follow?: InstaFollow;
  request?: InstaFollowRequest;
}

export class PrivacyService {
  static isBlocked(userAId: string, userBId: string): boolean {
    return instaStore.blocks.some(
      (b) =>
        (b.blockerId === userAId && b.blockedId === userBId) ||
        (b.blockerId === userBId && b.blockedId === userAId)
    );
  }

  static isFollowing(followerId: string, targetUserId: string): boolean {
    if (followerId === targetUserId) return true;
    return instaStore.follows.some(
      (f) => f.followerId === followerId && f.followingId === targetUserId
    );
  }

  /**
   * Evaluates if viewer has permission to view target user's posts, stories, and profile grid.
   */
  static canViewContent(viewerId: string | null, targetUserId: string): boolean {
    if (viewerId === targetUserId) return true;
    if (viewerId && this.isBlocked(viewerId, targetUserId)) return false;

    const profile = instaStore.profiles.find((p) => p.userId === targetUserId);
    if (!profile || !profile.isPrivate) {
      return true; // Public account
    }

    if (!viewerId) return false;
    return this.isFollowing(viewerId, targetUserId);
  }

  /**
   * Executes follow or follow-request based on target account privacy.
   */
  static followUser(followerId: string, targetUserId: string): FollowActionResult {
    if (followerId === targetUserId) {
      throw new Error('Cannot follow yourself');
    }

    if (this.isBlocked(followerId, targetUserId)) {
      throw new Error('Action blocked by safety controls');
    }

    if (this.isFollowing(followerId, targetUserId)) {
      throw new Error('Already following this user');
    }

    const targetProfile = instaStore.profiles.find((p) => p.userId === targetUserId);
    const isPrivate = targetProfile ? targetProfile.isPrivate : false;

    if (!isPrivate) {
      // Direct follow for public accounts
      const follow: InstaFollow = {
        id: `fl_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        followerId,
        followingId: targetUserId,
        createdAt: new Date(),
      };
      instaStore.follows.push(follow);

      return {
        status: 'ACCEPTED',
        message: 'Followed successfully',
        follow,
      };
    }

    // Check for existing pending request
    const existingReq = instaStore.followRequests.find(
      (r) => r.senderId === followerId && r.receiverId === targetUserId && r.status === 'PENDING'
    );
    if (existingReq) {
      return {
        status: 'PENDING',
        message: 'Follow request already pending',
        request: existingReq,
      };
    }

    const request: InstaFollowRequest = {
      id: `freq_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      senderId: followerId,
      receiverId: targetUserId,
      status: 'PENDING',
      createdAt: new Date(),
    };
    instaStore.followRequests.push(request);

    return {
      status: 'PENDING',
      message: 'Follow request sent to private account',
      request,
    };
  }

  /**
   * Approves a pending follow request for a private account.
   */
  static approveFollowRequest(requestId: string, receiverId: string): InstaFollow {
    const request = instaStore.followRequests.find((r) => r.id === requestId);
    if (!request || request.receiverId !== receiverId) {
      throw new Error('Follow request not found or unauthorized');
    }
    if (request.status !== 'PENDING') {
      throw new Error(`Cannot approve request in status ${request.status}`);
    }

    request.status = 'ACCEPTED';

    const follow: InstaFollow = {
      id: `fl_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      followerId: request.senderId,
      followingId: request.receiverId,
      createdAt: new Date(),
    };
    instaStore.follows.push(follow);

    return follow;
  }

  /**
   * Rejects a pending follow request.
   */
  static rejectFollowRequest(requestId: string, receiverId: string): void {
    const request = instaStore.followRequests.find((r) => r.id === requestId);
    if (!request || request.receiverId !== receiverId) {
      throw new Error('Follow request not found or unauthorized');
    }
    request.status = 'REJECTED';
  }
}
