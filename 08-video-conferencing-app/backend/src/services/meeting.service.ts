const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-video-conferencing-key-change-in-production-2026';

export class MeetingService {
  /**
   * Generates readable meeting room code in 'abc-defg-hij' format
   */
  public generateRoomCode(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const segment = (len: number) => {
      let res = '';
      for (let i = 0; i < len; i++) {
        res += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return res;
    };
    return `${segment(3)}-${segment(4)}-${segment(3)}`;
  }

  /**
   * Issue short-lived WebRTC join token containing room and peer claims
   */
  public generateJoinToken(roomCode: string, peerId: string, role: string, displayName: string): string {
    return jwt.sign(
      { roomCode, peerId, role, displayName },
      JWT_SECRET,
      { expiresIn: '4h' }
    );
  }

  /**
   * Validate join token
   */
  public verifyJoinToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch {
      return null;
    }
  }

  /**
   * Evaluates microphone audio level test (VU meter input 0 - 100)
   */
  public evaluateAudioLevel(samples: number[]): { averageLevel: number; peakLevel: number; isClipping: boolean } {
    if (!samples || samples.length === 0) {
      return { averageLevel: 0, peakLevel: 0, isClipping: false };
    }

    let sum = 0;
    let peak = 0;

    for (const s of samples) {
      const absVal = Math.abs(s);
      sum += absVal;
      if (absVal > peak) peak = absVal;
    }

    const averageLevel = Math.round(sum / samples.length);
    const peakLevel = Math.min(100, Math.round(peak));
    const isClipping = peakLevel >= 98;

    return { averageLevel, peakLevel, isClipping };
  }
}
