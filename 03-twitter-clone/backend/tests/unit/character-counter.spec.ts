import { CharacterCounterService } from '../../src/services/character-counter.service';

describe('CharacterCounterService', () => {
  it('should count plain ASCII characters accurately', () => {
    const text = 'Hello world!';
    expect(CharacterCounterService.calculateLength(text)).toBe(12);
  });

  it('should weight any URL as exactly 23 characters', () => {
    const shortUrl = 'https://t.co/xyz';
    const longUrl = 'https://verylongdomainname.example.com/some/path/to/an/article?param1=value1&param2=value2';

    expect(CharacterCounterService.calculateLength(shortUrl)).toBe(23);
    expect(CharacterCounterService.calculateLength(longUrl)).toBe(23);

    const textWithUrl = `Check this out: ${longUrl} amazing!`;
    // 'Check this out: ' (16) + URL (23) + ' amazing!' (9) = 48
    expect(CharacterCounterService.calculateLength(textWithUrl)).toBe(48);
  });

  it('should count complex emoji grapheme clusters as 1 character each', () => {
    const singleEmoji = '🔥';
    expect(CharacterCounterService.calculateLength(singleEmoji)).toBe(1);

    const zwjEmoji = '👩‍💻'; // Woman Technologist (ZWJ sequence)
    expect(CharacterCounterService.calculateLength(zwjEmoji)).toBe(1);

    const flagEmoji = '🏳️‍🌈'; // Rainbow Flag
    expect(CharacterCounterService.calculateLength(flagEmoji)).toBe(1);

    const combo = 'Dev 👩‍💻 at work 🏳️‍🌈!';
    // 'Dev ' (4) + '👩‍💻' (1) + ' at work ' (9) + '🏳️‍🌈' (1) + '!' (1) = 16
    expect(CharacterCounterService.calculateLength(combo)).toBe(16);
  });

  it('should validate 280 character limit correctly', () => {
    const exactly280 = 'a'.repeat(280);
    const result280 = CharacterCounterService.validate(exactly280);
    expect(result280.valid).toBe(true);
    expect(result280.remaining).toBe(0);

    const tooLong281 = 'a'.repeat(281);
    const result281 = CharacterCounterService.validate(tooLong281);
    expect(result281.valid).toBe(false);
    expect(result281.remaining).toBe(-1);

    const empty = '';
    expect(CharacterCounterService.validate(empty).valid).toBe(false);
  });
});
