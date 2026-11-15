import { PresenceService } from '../../src/services/presence.service';
import { chatStore } from '../../src/services/store.service';

describe('PresenceService TTL Handling', () => {
  beforeEach(() => {
    chatStore.clear();
  });

  it('should mark user ONLINE upon heartbeat and OFFLINE after TTL expires', () => {
    PresenceService.setOnline('usr_1');
    expect(PresenceService.getPresence('usr_1')).toBe('ONLINE');

    // Simulate 61 seconds passing
    const record = chatStore.presences.find(p => p.userId === 'usr_1');
    if (record) {
      record.lastHeartbeatAt = new Date(Date.now() - 65 * 1000);
    }

    expect(PresenceService.getPresence('usr_1')).toBe('OFFLINE');
  });

  it('should support explicit setOffline', () => {
    PresenceService.setOnline('usr_1');
    expect(PresenceService.getPresence('usr_1')).toBe('ONLINE');

    PresenceService.setOffline('usr_1');
    expect(PresenceService.getPresence('usr_1')).toBe('OFFLINE');
  });

  it('should expire typing indicators after 5 seconds of inactivity', () => {
    PresenceService.setTyping('conv_1', 'usr_1', true);
    expect(PresenceService.getTypingUsers('conv_1')).toContain('usr_1');

    // Manually expire the typing record
    const typingRecord = chatStore.typings.find(t => t.conversationId === 'conv_1' && t.userId === 'usr_1');
    if (typingRecord) {
      typingRecord.expiresAt = new Date(Date.now() - 1000); // 1 second in the past
    }

    expect(PresenceService.getTypingUsers('conv_1')).not.toContain('usr_1');
  });
});
