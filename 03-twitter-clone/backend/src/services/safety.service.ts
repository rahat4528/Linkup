import { TweetBlock, TweetMute, twitterStore } from './store.service';

export class SafetyService {
  /**
   * Mute an account. Preserves follow relationships, silently hides their posts from timeline.
   */
  public static muteUser(muterId: string, mutedId: string): TweetMute {
    if (muterId === mutedId) {
      throw new Error('Cannot mute yourself');
    }

    const existing = twitterStore.mutes.find(
      m => m.muterId === muterId && m.mutedId === mutedId
    );
    if (existing) return existing;

    const mute: TweetMute = {
      id: 'mute_' + Math.random().toString(36).substring(2, 9),
      muterId,
      mutedId,
      createdAt: new Date()
    };

    twitterStore.mutes.push(mute);
    return mute;
  }

  /**
   * Unmute an account.
   */
  public static unmuteUser(muterId: string, mutedId: string): boolean {
    const idx = twitterStore.mutes.findIndex(
      m => m.muterId === muterId && m.mutedId === mutedId
    );
    if (idx !== -1) {
      twitterStore.mutes.splice(idx, 1);
      return true;
    }
    return false;
  }

  /**
   * Block an account. Immediately severs follow relationship in both directions,
   * completely prevents interactions and viewing profiles.
   */
  public static blockUser(blockerId: string, blockedId: string): TweetBlock {
    if (blockerId === blockedId) {
      throw new Error('Cannot block yourself');
    }

    // Sever follows both ways
    twitterStore.follows = twitterStore.follows.filter(
      f => !(
        (f.followerId === blockerId && f.followingId === blockedId) ||
        (f.followerId === blockedId && f.followingId === blockerId)
      )
    );

    const existing = twitterStore.blocks.find(
      b => b.blockerId === blockerId && b.blockedId === blockedId
    );
    if (existing) return existing;

    const block: TweetBlock = {
      id: 'block_' + Math.random().toString(36).substring(2, 9),
      blockerId,
      blockedId,
      createdAt: new Date()
    };

    twitterStore.blocks.push(block);
    return block;
  }

  /**
   * Unblock an account.
   */
  public static unblockUser(blockerId: string, blockedId: string): boolean {
    const idx = twitterStore.blocks.findIndex(
      b => b.blockerId === blockerId && b.blockedId === blockedId
    );
    if (idx !== -1) {
      twitterStore.blocks.splice(idx, 1);
      return true;
    }
    return false;
  }

  /**
   * Checks if either user has blocked the other.
   */
  public static isBlockedBetween(userA: string, userB: string): boolean {
    return twitterStore.blocks.some(
      b => (b.blockerId === userA && b.blockedId === userB) ||
           (b.blockerId === userB && b.blockedId === userA)
    );
  }

  /**
   * Checks if muter has muted mutedId.
   */
  public static isMuted(muterId: string, mutedId: string): boolean {
    return twitterStore.mutes.some(
      m => m.muterId === muterId && m.mutedId === mutedId
    );
  }
}
