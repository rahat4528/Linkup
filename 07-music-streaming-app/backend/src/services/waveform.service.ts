import { WaveformOptions } from '../types';

export class WaveformService {
  /**
   * Extracts amplitude peaks from audio buffer and normalizes them into bins.
   * If buffer is empty or smaller than bins, pads or interpolates.
   */
  public extractPeaks(audioBuffer: Buffer, options: WaveformOptions = { bins: 100, normalizeMax: 100 }): number[] {
    const bins = options.bins > 0 ? options.bins : 100;
    const normalizeMax = options.normalizeMax || 100;

    if (!audioBuffer || audioBuffer.length === 0) {
      return new Array(bins).fill(0);
    }

    const blockSize = Math.max(1, Math.floor(audioBuffer.length / bins));
    const rawPeaks: number[] = [];

    for (let i = 0; i < bins; i++) {
      const start = i * blockSize;
      const end = Math.min(start + blockSize, audioBuffer.length);

      let maxSample = 0;
      for (let j = start; j < end; j++) {
        const val = Math.abs(audioBuffer[j] - 128); // 8-bit PCM center offset
        if (val > maxSample) {
          maxSample = val;
        }
      }

      rawPeaks.push(maxSample);
    }

    // Find highest peak for global normalization
    const maxVal = Math.max(...rawPeaks, 1);

    // Normalize all peaks to 0 .. normalizeMax
    return rawPeaks.map((peak) => {
      const normalized = Math.round((peak / maxVal) * normalizeMax);
      return Math.min(normalizeMax, Math.max(2, normalized)); // Minimum 2 for visible baseline
    });
  }

  /**
   * Generate smooth synthetic peaks based on duration and seed
   * Used for seeded tracks or quick previews without full FFmpeg decoding
   */
  public generateSyntheticPeaks(bins: number = 100, seed: number = 42): number[] {
    const peaks: number[] = [];
    for (let i = 0; i < bins; i++) {
      const progress = i / bins;
      // Multi-frequency harmonic synthesis
      const wave1 = Math.sin(progress * Math.PI) * 45;
      const wave2 = Math.sin(progress * Math.PI * 4 + seed) * 20;
      const wave3 = Math.cos(progress * Math.PI * 8) * 15;
      const noise = ((Math.sin(i * 12.9898 + seed) * 43758.5453) % 1) * 15;

      const raw = Math.abs(wave1 + wave2 + wave3 + Math.abs(noise));
      const normalized = Math.min(100, Math.max(5, Math.round(raw)));
      peaks.push(normalized);
    }
    return peaks;
  }
}
