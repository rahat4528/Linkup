import * as fs from 'fs';
import { RangeRequest } from '../types';

export class StreamingService {
  private defaultChunkSize: number;

  constructor(defaultChunkSize: number = 1024 * 1024) { // 1MB chunks by default
    this.defaultChunkSize = defaultChunkSize;
  }

  /**
   * Parse and validate HTTP Range header against total file size.
   * Specification complies with RFC 7233 (HTTP/1.1 Range Requests).
   */
  public parseRange(rangeHeader: string | undefined, totalFileSize: number): RangeRequest {
    if (!rangeHeader || !rangeHeader.startsWith('bytes=')) {
      // No range provided; stream entire file or default chunk
      const start = 0;
      const end = Math.min(totalFileSize - 1, this.defaultChunkSize - 1);
      return {
        start,
        end,
        chunkSize: end - start + 1,
        totalSize: totalFileSize,
        isValid: true,
        contentRange: `bytes ${start}-${end}/${totalFileSize}`
      };
    }

    const rangePart = rangeHeader.replace(/bytes=/, '').trim();

    // Suffix range: bytes=-500 (last 500 bytes)
    if (rangePart.startsWith('-')) {
      const suffixLength = parseInt(rangePart.substring(1), 10);
      if (isNaN(suffixLength) || suffixLength <= 0) {
        return this.createInvalidRange(totalFileSize);
      }
      const start = Math.max(0, totalFileSize - suffixLength);
      const end = totalFileSize - 1;
      return {
        start,
        end,
        chunkSize: end - start + 1,
        totalSize: totalFileSize,
        isValid: true,
        contentRange: `bytes ${start}-${end}/${totalFileSize}`
      };
    }

    const parts = rangePart.split('-');
    const start = parseInt(parts[0], 10);
    let end = parts[1] ? parseInt(parts[1], 10) : totalFileSize - 1;

    // Validation checks
    if (isNaN(start) || start < 0 || start >= totalFileSize) {
      return this.createInvalidRange(totalFileSize);
    }

    if (isNaN(end) || end < start) {
      return this.createInvalidRange(totalFileSize);
    }

    // Clamp end if larger than total file size
    if (end >= totalFileSize) {
      end = totalFileSize - 1;
    }

    // Limit maximum chunk size per request to prevent buffer overflow/exhaustion
    if (end - start + 1 > this.defaultChunkSize) {
      end = start + this.defaultChunkSize - 1;
      if (end >= totalFileSize) {
        end = totalFileSize - 1;
      }
    }

    return {
      start,
      end,
      chunkSize: end - start + 1,
      totalSize: totalFileSize,
      isValid: true,
      contentRange: `bytes ${start}-${end}/${totalFileSize}`
    };
  }

  private createInvalidRange(totalFileSize: number): RangeRequest {
    return {
      start: -1,
      end: -1,
      chunkSize: 0,
      totalSize: totalFileSize,
      isValid: false,
      contentRange: `bytes */${totalFileSize}`
    };
  }

  /**
   * Creates readable stream slice from audio file on disk
   */
  public createAudioStream(filePath: string, start: number, end: number): fs.ReadStream {
    return fs.createReadStream(filePath, { start, end });
  }

  /**
   * Read audio slice from in-memory buffer
   */
  public sliceBuffer(buffer: Buffer, start: number, end: number): Buffer {
    return buffer.subarray(start, end + 1);
  }
}
