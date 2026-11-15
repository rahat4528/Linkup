import { VisibilityService } from '../../src/services/visibility.service';
import { memoryStore, StoredPost, StoredUser } from '../../src/services/store.service';

describe('VisibilityService — Permission & Visibility Matrix', () => {
  const aliceId = 'user_alice';
  const bobId = 'user_bob';
  const charlieId = 'user_charlie';
  const blockedUserId = 'user_blocked';

  beforeEach(() => {
    memoryStore.clear();

    // Friend relationship between Alice and Bob
    memoryStore.friendships.push({
      id: 'f1',
      userAId: aliceId,
      userBId: bobId,
      createdAt: new Date(),
    });

    // Block relationship: Alice blocks blockedUserId
    memoryStore.blocks.push({
      id: 'b1',
      blockerId: aliceId,
      blockedId: blockedUserId,
      createdAt: new Date(),
    });

    // Private group where Alice and Bob are members, Charlie is not
    memoryStore.groups.push({
      id: 'grp_private',
      name: 'Private Core Team',
      privacy: 'PRIVATE',
      creatorId: aliceId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    memoryStore.groupMembers.push({
      id: 'gm1',
      groupId: 'grp_private',
      userId: aliceId,
      role: 'OWNER',
      joinedAt: new Date(),
    });

    memoryStore.groupMembers.push({
      id: 'gm2',
      groupId: 'grp_private',
      userId: bobId,
      role: 'MEMBER',
      joinedAt: new Date(),
    });
  });

  it('PUBLIC post is viewable by friends, strangers, but denied to blocked users', () => {
    const publicPost: StoredPost = {
      id: 'p1',
      authorId: aliceId,
      content: 'Hello World',
      visibility: 'PUBLIC',
      isEdited: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(VisibilityService.canViewPost(bobId, publicPost)).toBe(true);
    expect(VisibilityService.canViewPost(charlieId, publicPost)).toBe(true);
    expect(VisibilityService.canViewPost(null, publicPost)).toBe(true);
    // Two-way block check: blocked user cannot view
    expect(VisibilityService.canViewPost(blockedUserId, publicPost)).toBe(false);
  });

  it('FRIENDS post is viewable only by author and mutual friends', () => {
    const friendsPost: StoredPost = {
      id: 'p2',
      authorId: aliceId,
      content: 'Friends Only Update',
      visibility: 'FRIENDS',
      isEdited: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(VisibilityService.canViewPost(aliceId, friendsPost)).toBe(true);
    expect(VisibilityService.canViewPost(bobId, friendsPost)).toBe(true);
    expect(VisibilityService.canViewPost(charlieId, friendsPost)).toBe(false);
    expect(VisibilityService.canViewPost(blockedUserId, friendsPost)).toBe(false);
  });

  it('GROUP_ONLY post in private group is viewable only by active group members', () => {
    const groupPost: StoredPost = {
      id: 'p3',
      authorId: aliceId,
      content: 'Secret Group Discussion',
      visibility: 'GROUP_ONLY',
      groupId: 'grp_private',
      isEdited: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(VisibilityService.canViewPost(bobId, groupPost)).toBe(true);
    expect(VisibilityService.canViewPost(charlieId, groupPost)).toBe(false);
    expect(VisibilityService.canViewPost(null, groupPost)).toBe(false);
  });

  it('ONLY_ME post is strictly restricted to the author', () => {
    const privatePost: StoredPost = {
      id: 'p4',
      authorId: aliceId,
      content: 'Personal Draft Note',
      visibility: 'ONLY_ME',
      isEdited: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(VisibilityService.canViewPost(aliceId, privatePost)).toBe(true);
    expect(VisibilityService.canViewPost(bobId, privatePost)).toBe(false);
    expect(VisibilityService.canViewPost(charlieId, privatePost)).toBe(false);
  });

  it('Two-way block prevents either party from interacting or viewing content', () => {
    expect(VisibilityService.isBlocked(aliceId, blockedUserId)).toBe(true);
    expect(VisibilityService.isBlocked(blockedUserId, aliceId)).toBe(true);
    expect(VisibilityService.isBlocked(bobId, charlieId)).toBe(false);
  });
});
