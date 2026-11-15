import { MeetingService } from '../../src/services/meeting.service';

describe('MeetingService - Room Codes, Tokens, and Audio VU Meter', () => {
  let service: MeetingService;

  beforeEach(() => {
    service = new MeetingService();
  });

  it('should generate room code matching xxx-yyyy-zzz format', () => {
    const code = service.generateRoomCode();
    expect(code).toMatch(/^[a-z]{3}-[a-z]{4}-[a-z]{3}$/);
  });

  it('should issue and verify valid WebRTC join tokens', () => {
    const token = service.generateJoinToken('eng-sync-2026', 'peer-test', 'PARTICIPANT', 'Test User');
    expect(typeof token).toBe('string');

    const decoded = service.verifyJoinToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded.roomCode).toBe('eng-sync-2026');
    expect(decoded.peerId).toBe('peer-test');
    expect(decoded.displayName).toBe('Test User');
  });

  it('should reject invalid or tampered tokens', () => {
    const decoded = service.verifyJoinToken('invalid.token.signature');
    expect(decoded).toBeNull();
  });

  it('should evaluate microphone audio level samples', () => {
    const samples = [10, 20, 30, 40, 50];
    const result = service.evaluateAudioLevel(samples);

    expect(result.averageLevel).toBe(30);
    expect(result.peakLevel).toBe(50);
    expect(result.isClipping).toBe(false);
  });

  it('should detect audio clipping on loud signals', () => {
    const samples = [95, 99, 100, 98];
    const result = service.evaluateAudioLevel(samples);

    expect(result.peakLevel).toBe(100);
    expect(result.isClipping).toBe(true);
  });
});
