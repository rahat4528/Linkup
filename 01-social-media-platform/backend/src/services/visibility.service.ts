import { memoryStore, StoredPost } from './store.service';

export class VisibilityService {
  /**
   * Checks whether a two-way block relationship exists between two users.
   */
  static isBlocked(userAId: string, userBId: string): boolean {
    if (userAId === userBId) return false;
    return memoryStore.blocks.some(
      (b) =>
        (b.blockerId === userAId && b.blockedId === userBId) ||
        (b.blockerId === userBId && b.blockedId === userAId)
    );
  }

  /**
   * Checks if two users are mutual friends.
   */
  static areFriends(userAId: string, userBId: string): boolean {
    if (userAId === userBId) return true;
    return memoryStore.friendships.some(
      (f) =>
        (f.userAId === userAId && f.userBId === userBId) ||
        (f.userAId === userBId && f.userBId === userAId)
    );
  }

  /**
   * Checks if a user is an active member of a group.
   */
  static isGroupMember(userId: string, groupId: string): boolean {
    return memoryStore.groupMembers.some(
      (m) => m.groupId === groupId && m.userId === userId
    );
  }

  /**
   * Determines if viewer has permission to view a specific post based on visibility matrix.
   */
  static canViewPost(viewerId: string | null, post: StoredPost): boolean {
    // 1. Author can always view their own post
    if (viewerId === post.authorId) return true;

    // 2. If viewer is blocked by author or viewer blocked author -> DENIED
    if (viewerId && this.isBlocked(viewerId, post.authorId)) {
      return false;
    }

    // 3. Evaluate visibility levels
    switch (post.visibility) {
      case 'PUBLIC':
        return true;

      case 'FRIENDS':
        if (!viewerId) return false;
        return this.areFriends(viewerId, post.authorId);

      case 'GROUP_ONLY':
        if (!post.groupId) return false;
        const group = memoryStore.groups.find((g) => g.id === post.groupId);
        if (!group) return false;
        if (group.privacy === 'PUBLIC') return true;
        if (!viewerId) return false;
        return this.isGroupMember(viewerId, post.groupId);

      case 'ONLY_ME':
        return viewerId === post.authorId;

      default:
        return false;
    }
  }

  /**
   * Determines if viewer has permission to view a user profile.
   */
  static canViewProfile(viewerId: string | null, targetUserId: string): boolean {
    if (viewerId === targetUserId) return true;
    if (viewerId && this.isBlocked(viewerId, targetUserId)) return false;

    const profile = memoryStore.profiles.find((p) => p.userId === targetUserId);
    if (!profile) return true; // Default public if not configured

    if (profile.profilePrivacy === 'PUBLIC') return true;
    if (profile.profilePrivacy === 'FRIENDS') {
      if (!viewerId) return false;
      return this.areFriends(viewerId, targetUserId);
    }
    return viewerId === targetUserId;
  }
}
