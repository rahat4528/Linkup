import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { WaveformService } from '../services/waveform.service';

export const mockTracks = new Map<string, any>();
export const mockFavorites = new Set<string>(); // "userId:trackId"

const waveformService = new WaveformService();

// Prepopulate sample tracks for testing and immediate availability
const sampleTrack1 = {
  id: 'track-1',
  title: 'Neon Horizon',
  artist: 'Sonic Flow',
  album: 'Cybernetic Echoes',
  genre: 'Synthwave',
  durationSeconds: 214.5,
  fileSize: 1048576, // 1MB for mock buffer testing
  mimeType: 'audio/mpeg',
  filePath: 'media/track-1.mp3',
  waveformData: waveformService.generateSyntheticPeaks(120, 101),
  playCount: 1420,
  uploaderId: 'artist-1',
  createdAt: new Date().toISOString()
};

const sampleTrack2 = {
  id: 'track-2',
  title: 'Midnight Reverie',
  artist: 'Sonic Flow',
  album: 'Atmospheric Depths',
  genre: 'Lo-Fi Chill',
  durationSeconds: 182.0,
  fileSize: 819200,
  mimeType: 'audio/mpeg',
  filePath: 'media/track-2.mp3',
  waveformData: waveformService.generateSyntheticPeaks(120, 202),
  playCount: 980,
  uploaderId: 'artist-1',
  createdAt: new Date().toISOString()
};

mockTracks.set(sampleTrack1.id, sampleTrack1);
mockTracks.set(sampleTrack2.id, sampleTrack2);

export class TrackController {
  public async getTracks(req: Request, res: Response) {
    const { genre, search } = req.query;
    let tracks = Array.from(mockTracks.values());

    if (genre && typeof genre === 'string') {
      tracks = tracks.filter((t) => t.genre?.toLowerCase() === genre.toLowerCase());
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      tracks = tracks.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        (t.album && t.album.toLowerCase().includes(q))
      );
    }

    return res.status(200).json({ tracks, total: tracks.length });
  }

  public async getTrackById(req: Request, res: Response) {
    const { id } = req.params;
    const track = mockTracks.get(id as string);

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    return res.status(200).json({ track });
  }

  public async getWaveform(req: Request, res: Response) {
    const { id } = req.params;
    const track = mockTracks.get(id as string);

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    return res.status(200).json({
      trackId: track.id,
      waveform: track.waveformData || []
    });
  }

  public async createTrack(req: AuthenticatedRequest, res: Response) {
    try {
      const { title, artist, album, genre, durationSeconds, fileSize, mimeType, audioBufferBase64 } = req.body;

      if (!title || !artist) {
        return res.status(400).json({ error: 'Title and artist are required' });
      }

      const uploaderId = req.user?.id || 'anonymous';
      const id = `track-${Date.now()}`;

      // Calculate waveform peaks from buffer or generate
      let waveformData: number[];
      if (audioBufferBase64) {
        const buffer = Buffer.from(audioBufferBase64, 'base64');
        waveformData = waveformService.extractPeaks(buffer, { bins: 100 });
      } else {
        waveformData = waveformService.generateSyntheticPeaks(100);
      }

      const newTrack = {
        id,
        title,
        artist,
        album: album || 'Single',
        genre: genre || 'Electronic',
        durationSeconds: durationSeconds || 180.0,
        fileSize: fileSize || 2048000,
        mimeType: mimeType || 'audio/mpeg',
        filePath: `media/${id}.mp3`,
        waveformData,
        playCount: 0,
        uploaderId,
        createdAt: new Date().toISOString()
      };

      mockTracks.set(id, newTrack);
      return res.status(201).json({ track: newTrack });
    } catch (err: any) {
      return res.status(500).json({ error: 'Track creation failed', details: err.message });
    }
  }

  public async toggleFavorite(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const track = mockTracks.get(id as string);
    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    const favKey = `${userId}:${id}`;
    let isFavorited = false;

    if (mockFavorites.has(favKey)) {
      mockFavorites.delete(favKey);
      isFavorited = false;
    } else {
      mockFavorites.add(favKey);
      isFavorited = true;
    }

    return res.status(200).json({ trackId: id, isFavorited });
  }
}
