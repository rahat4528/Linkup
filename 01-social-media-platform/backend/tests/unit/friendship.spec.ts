import { FriendshipService } from '../../src/services/friendship.service';
import { memoryStore } from '../../src/services/store.service';

describe('FriendshipService — State Machine & Mutual Requests', () => {
  const userA = 'user_a';
  const userB = 'user_b';
  const userC = 'user_c';

  beforeEach(() => {
    memoryStore.clear();
  });

  it('standard flow: sends friend request and transitions to REQUESTED', () => {
    const res = FriendshipService.sendFriendRequest(userA, userB);
    expect(res.status).toBe('REQUESTED');
    expect(res.request).toBeDefined();
    expect(res.request?.status).toBe('REQUESTED');
    expect(memoryStore.friendRequests.length).toBe(1);
  });

  it('accepts friend request and forms bidirectional friendship', () => {
    const res = FriendshipService.sendFriendRequest(userA, userB);
    const friendship = FriendshipService.acceptFriendRequest(res.request!.id, userB);

    expect(friendship).toBeDefined();
    expect(FriendshipService.getFriendIds(userA)).toContain(userB);
    expect(FriendshipService.getFriendIds(userB)).toContain(userA);
  });

  it('handles simultaneous mutual friend requests deterministically', () => {
    // User A sends request to User B
    const res1 = FriendshipService.sendFriendRequest(userA, userB);
    expect(res1.status).toBe('REQUESTED');

    // Simultaneously, User B sends request to User A
    const res2 = FriendshipService.sendFriendRequest(userB, userA);
    expect(res2.status).toBe('ACCEPTED');
    expect(res2.message).toContain('Simultaneous mutual request detected');

    // Direct friendship should now be established
    expect(FriendshipService.getFriendIds(userA)).toContain(userB);
    expect(FriendshipService.getFriendIds(userB)).toContain(userA);
  });

  it('calculates mutual friends accurately', () => {
    // A is friends with B and C
    memoryStore.friendships.push(
      { id: 'f1', userAId: userA, userBId: userB, createdAt: new Date() },
      { id: 'f2', userAId: userA, userBId: userC, createdAt: new Date() }
    );

    // B is friends with A and C
    memoryStore.friendships.push(
      { id: 'f3', userAId: userB, userBId: userA, createdAt: new Date() },
      { id: 'f4', userAId: userB, userBId: userC, createdAt: new Date() }
    );

    const mutuals = FriendshipService.getMutualFriendIds(userA, userB);
    expect(mutuals).toEqual([userC]);
  });

  it('unfriends a user cleanly', () => {
    memoryStore.friendships.push(
      { id: 'f1', userAId: userA, userBId: userB, createdAt: new Date() },
      { id: 'f2', userAId: userB, userBId: userA, createdAt: new Date() }
    );
    expect(FriendshipService.getFriendIds(userA).length).toBe(1);

    FriendshipService.unfriend(userA, userB);
    expect(FriendshipService.getFriendIds(userA).length).toBe(0);
    expect(FriendshipService.getFriendIds(userB).length).toBe(0);
  });
});
