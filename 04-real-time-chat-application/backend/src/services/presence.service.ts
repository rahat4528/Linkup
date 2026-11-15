import { chatStore, ChatPresence, ChatTyping } from './store.service';

export class PresenceService {
  private static readonly PRESENCE_TTL_MS = 60 * 1000; // 60s
  private static readonly TYPING_TTL_MS = 5 * 1000; // 5s

  /**
   * Heartbeat to mark user ONLINE.
   */
  public static setOnline(userId: string): ChatPresence {
    const existing = chatStore.presences.find(p => p.userId === userId);
    if (existing) {
      existing.status = 'ONLINE';
      existing.lastHeartbeatAt = new Date();
      return existing;
    }

    const presence: ChatPresence = {
      userId,
      status: 'ONLINE',
      lastHeartbeatAt: new Date()
    };
    chatStore.presences.push(presence);
    return presence;
  }

  /**
   * Explicitly sets user OFFLINE (e.g. on disconnect).
   */
  public static setOffline(userId: string): void {
    const existing = chatStore.presences.find(p => p.userId === userId);
    if (existing) {
      existing.status = 'OFFLINE';
      existing.lastHeartbeatAt = new Date();
    }
  }

  /**
   * Retrieves presence status, applying 60s TTL timeout.
   */
  public static getPresence(userId: string): 'ONLINE' | 'OFFLINE' {
    const presence = chatStore.presences.find(p => p.userId === userId);
    if (!presence) return 'OFFLINE';

    if (presence.status === 'ONLINE') {
      const elapsed = Date.now() - presence.lastHeartbeatAt.getTime();
      if (elapsed > this.PRESENCE_TTL_MS) {
        presence.status = 'OFFLINE';
        return 'OFFLINE';
      }
    }
    return presence.status;
  }

  /**
   * Sets typing state for conversation with 5-second TTL.
   */
  public static setTyping(conversationId: string, userId: string, isTyping: boolean): void {
    const idx = chatStore.typings.findIndex(
      t => t.conversationId === conversationId && t.userId === userId
    );

    if (!isTyping) {
      if (idx !== -1) chatStore.typings.splice(idx, 1);
      return;
    }

    const expiresAt = new Date(Date.now() + this.TYPING_TTL_MS);
    if (idx !== -1) {
      chatStore.typings[idx].expiresAt = expiresAt;
    } else {
      chatStore.typings.push({ conversationId, userId, expiresAt });
    }
  }

  /**
   * Gets currently typing users in a conversation, filtering out expired ones.
   */
  public static getTypingUsers(conversationId: string): string[] {
    const now = new Date();
    // Prune expired
    chatStore.typings = chatStore.typings.filter(t => t.expiresAt > now);

    return chatStore.typings
      .filter(t => t.conversationId === conversationId)
      .map(t => t.userId);
  }
}
