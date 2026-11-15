import { memoryStore, StoredFriendRequest, StoredFriendship } from './store.service';
import { VisibilityService } from './visibility.service';

export interface FriendRequestResult {
  status: 'REQUESTED' | 'ACCEPTED';
  request?: StoredFriendRequest;
  friendship?: StoredFriendship;
  message: string;
}

export class FriendshipService {
  /**
   * Retrieves all friend IDs for a given user.
   */
  static getFriendIds(userId: string): string[] {
    const ids = new Set<string>();
    for (const f of memoryStore.friendships) {
      if (f.userAId === userId) ids.add(f.userBId);
      if (f.userBId === userId) ids.add(f.userAId);
    }
    return Array.from(ids);
  }

  /**
   * Calculates mutual friends between two users.
   */
  static getMutualFriendIds(userAId: string, userBId: string): string[] {
    if (userAId === userBId) return [];
    const friendsA = new Set(this.getFriendIds(userAId));
    const friendsB = this.getFriendIds(userBId);
    return friendsB.filter((id) => friendsA.has(id));
  }

  /**
   * Sends a friend request. Detects simultaneous mutual requests and resolves to ACCEPTED immediately.
   */
  static sendFriendRequest(senderId: string, receiverId: string): FriendRequestResult {
    if (senderId === receiverId) {
      throw new Error('Cannot send friend request to yourself');
    }

    if (VisibilityService.isBlocked(senderId, receiverId)) {
      throw new Error('Action blocked by safety settings');
    }

    if (VisibilityService.areFriends(senderId, receiverId)) {
      throw new Error('Already friends');
    }

    // Check if inverse request already exists in REQUESTED status (Simultaneous mutual request)
    const inverseRequest = memoryStore.friendRequests.find(
      (r) => r.senderId === receiverId && r.receiverId === senderId && r.status === 'REQUESTED'
    );

    if (inverseRequest) {
      // Transition inverse request to ACCEPTED
      inverseRequest.status = 'ACCEPTED';
      inverseRequest.updatedAt = new Date();

      // Establish bidirectional friendship
      const friendship1: StoredFriendship = {
        id: `f_${Date.now()}_1`,
        userAId: senderId,
        userBId: receiverId,
        createdAt: new Date(),
      };
      const friendship2: StoredFriendship = {
        id: `f_${Date.now()}_2`,
        userAId: receiverId,
        userBId: senderId,
        createdAt: new Date(),
      };
      memoryStore.friendships.push(friendship1, friendship2);

      return {
        status: 'ACCEPTED',
        friendship: friendship1,
        message: 'Simultaneous mutual request detected: Connection established directly.',
      };
    }

    // Check if duplicate existing request from sender
    const existing = memoryStore.friendRequests.find(
      (r) => r.senderId === senderId && r.receiverId === receiverId && r.status === 'REQUESTED'
    );
    if (existing) {
      return {
        status: 'REQUESTED',
        request: existing,
        message: 'Friend request already pending.',
      };
    }

    const newRequest: StoredFriendRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      senderId,
      receiverId,
      status: 'REQUESTED',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.friendRequests.push(newRequest);

    return {
      status: 'REQUESTED',
      request: newRequest,
      message: 'Friend request sent successfully.',
    };
  }

  /**
   * Accepts a pending friend request.
   */
  static acceptFriendRequest(requestId: string, receiverId: string): StoredFriendship {
    const request = memoryStore.friendRequests.find((r) => r.id === requestId);
    if (!request) {
      throw new Error('Friend request not found');
    }
    if (request.receiverId !== receiverId) {
      throw new Error('Unauthorized to accept this request');
    }
    if (request.status !== 'REQUESTED') {
      throw new Error(`Cannot accept request in status ${request.status}`);
    }

    request.status = 'ACCEPTED';
    request.updatedAt = new Date();

    const friendship1: StoredFriendship = {
      id: `f_${Date.now()}_1`,
      userAId: request.senderId,
      userBId: request.receiverId,
      createdAt: new Date(),
    };
    const friendship2: StoredFriendship = {
      id: `f_${Date.now()}_2`,
      userAId: request.receiverId,
      userBId: request.senderId,
      createdAt: new Date(),
    };
    memoryStore.friendships.push(friendship1, friendship2);

    return friendship1;
  }

  /**
   * Rejects a pending friend request.
   */
  static rejectFriendRequest(requestId: string, receiverId: string): void {
    const request = memoryStore.friendRequests.find((r) => r.id === requestId);
    if (!request || request.receiverId !== receiverId) {
      throw new Error('Friend request not found or unauthorized');
    }
    request.status = 'REJECTED';
    request.updatedAt = new Date();
  }

  /**
   * Cancels an outgoing friend request.
   */
  static cancelFriendRequest(requestId: string, senderId: string): void {
    const request = memoryStore.friendRequests.find((r) => r.id === requestId);
    if (!request || request.senderId !== senderId) {
      throw new Error('Friend request not found or unauthorized');
    }
    request.status = 'CANCELLED';
    request.updatedAt = new Date();
  }

  /**
   * Unfriends a user.
   */
  static unfriend(userAId: string, userBId: string): void {
    memoryStore.friendships = memoryStore.friendships.filter(
      (f) =>
        !(
          (f.userAId === userAId && f.userBId === userBId) ||
          (f.userAId === userBId && f.userBId === userAId)
        )
    );
  }

  /**
   * Generates friend recommendations based on mutual friend counts.
   */
  static getRecommendations(userId: string, limit = 5): Array<{ userId: string; mutualCount: number }> {
    const currentFriendIds = new Set(this.getFriendIds(userId));
    currentFriendIds.add(userId);

    const candidates = new Map<string, number>();

    for (const friendId of this.getFriendIds(userId)) {
      for (const secondDegreeId of this.getFriendIds(friendId)) {
        if (!currentFriendIds.has(secondDegreeId) && !VisibilityService.isBlocked(userId, secondDegreeId)) {
          const currentCount = candidates.get(secondDegreeId) || 0;
          candidates.set(secondDegreeId, currentCount + 1);
        }
      }
    }

    return Array.from(candidates.entries())
      .map(([candId, mutualCount]) => ({ userId: candId, mutualCount }))
      .sort((a, b) => b.mutualCount - a.mutualCount)
      .slice(0, limit);
  }
}
