import { Request, Response } from 'express';
import { musicStore, MusicTrack } from '../services/store.service';

export class TrackController {
  public static async getTrack(req: Request, res: Response): Promise<void> {
    try {
      const trackId = req.params.id as string;
      const track = musicStore.tracks.find(t => t.id === trackId);

      if (!track) {
        res.status(404).json({ error: 'Track not found' });
        return;
      }

      const artist = musicStore.artists.find(a => a.id === track.artistId);
      const album = track.albumId ? musicStore.albums.find(a => a.id === track.albumId) : null;

      res.status(200).json({
        track: {
          ...track,
          artistName: artist?.name || 'Unknown Artist',
          albumTitle: album?.title,
          coverUrl: album?.coverUrl
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async createTrack(req: Request, res: Response): Promise<void> {
    try {
      const { title, artistId, albumId, durationMs, audioUrl, trackNumber } = req.body;

      if (!title || !artistId || !audioUrl) {
        res.status(400).json({ error: 'title, artistId, and audioUrl are required' });
        return;
      }

      const track: MusicTrack = {
        id: 'trk_' + Math.random().toString(36).substring(2, 9),
        title,
        artistId,
        albumId,
        durationMs: durationMs || 180000,
        audioUrl,
        trackNumber: trackNumber || 1,
        createdAt: new Date()
      };

      musicStore.tracks.push(track);
      res.status(201).json({ track });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
}
