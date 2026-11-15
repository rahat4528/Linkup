import { WaveformService } from '../../src/services/waveform.service';

describe('WaveformService - Peak Extraction and Normalization', () => {
  let service: WaveformService;

  beforeEach(() => {
    service = new WaveformService();
  });

  it('should extract peaks into requested number of bins', () => {
    // Generate synthetic audio buffer of 4096 bytes
    const buffer = Buffer.alloc(4096);
    for (let i = 0; i < 4096; i++) {
      buffer[i] = Math.floor(Math.sin(i / 10) * 127 + 128);
    }

    const peaks = service.extractPeaks(buffer, { bins: 64, normalizeMax: 100 });
    expect(peaks).toBeInstanceOf(Array);
    expect(peaks.length).toBe(64);

    // Verify all normalized peaks are within [0, 100]
    peaks.forEach((peak) => {
      expect(peak).toBeGreaterThanOrEqual(0);
      expect(peak).toBeLessThanOrEqual(100);
    });
  });

  it('should handle empty buffer gracefully', () => {
    const emptyBuffer = Buffer.alloc(0);
    const peaks = service.extractPeaks(emptyBuffer, { bins: 50 });
    expect(peaks.length).toBe(50);
    expect(peaks.every((p) => p === 0)).toBe(true);
  });

  it('should generate deterministic synthetic peaks', () => {
    const peaks1 = service.generateSyntheticPeaks(80, 123);
    const peaks2 = service.generateSyntheticPeaks(80, 123);

    expect(peaks1.length).toBe(80);
    expect(peaks1).toEqual(peaks2);
    expect(Math.max(...peaks1)).toBeLessThanOrEqual(100);
  });
});
