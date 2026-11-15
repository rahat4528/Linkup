import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { StreamingService } from '../services/streaming.service';
import { AudioCacheService } from '../services/cache.service';
import { mockTracks } from './track.controller';

const streamingService = new StreamingService(1024 * 1024); // 1MB default chunk size
const cacheService = new AudioCacheService();

// Synthetic audio buffer generator for testing when actual audio files are not on disk
function getMockAudioBuffer(size: number): Buffer {
  const buf = Buffer.alloc(size);
  for (let i = 0; i < size; i++) {
    buf[i] = (i % 256);
  }
  return buf;
}

export class StreamController {
  public async streamTrack(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const track = mockTracks.get(id as string);

      if (!track) {
        return res.status(404).json({ error: 'Track not found' });
      }

      const totalFileSize = track.fileSize || 1048576; // 1MB default
      const rangeHeader = req.headers.range;

      // Handle Range request
      const range = streamingService.parseRange(rangeHeader, totalFileSize);

      if (!range.isValid) {
        res.setHeader('Content-Range', range.contentRange);
        return res.status(416).send('Range Not Satisfiable');
      }

      const { start, end, chunkSize } = range;

      // Check if file exists on disk
      const resolvedPath = path.resolve(track.filePath);
      const fileExists = fs.existsSync(resolvedPath);

      // Check cache first
      let chunkBuffer = cacheService.get(track.id, start, end);

      if (!chunkBuffer) {
        if (fileExists) {
          // Read from disk
          const stream = streamingService.createAudioStream(resolvedPath, start, end);
          res.writeHead(206, {
            'Content-Range': range.contentRange,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': track.mimeType || 'audio/mpeg'
          });
          return stream.pipe(res);
        } else {
          // Generate deterministic mock audio slice for development/test fidelity
          const fullMock = getMockAudioBuffer(totalFileSize);
          chunkBuffer = streamingService.sliceBuffer(fullMock, start, end);
          cacheService.set(track.id, start, end, chunkBuffer);
        }
      }

      // Stream the buffer
      res.writeHead(206, {
        'Content-Range': range.contentRange,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': track.mimeType || 'audio/mpeg'
      });

      return res.end(chunkBuffer);
    } catch (err: any) {
      return res.status(500).json({ error: 'Audio streaming error', details: err.message });
    }
  }

  public async getStreamStats(req: Request, res: Response) {
    return res.status(200).json({
      cachedChunks: cacheService.size(),
      streamingProtocol: 'HTTP/1.1 Range Requests (RFC 7233)',
      supportedCodecs: ['audio/mpeg', 'audio/webm', 'audio/wav', 'audio/ogg', 'audio/flac']
    });
  }
}
