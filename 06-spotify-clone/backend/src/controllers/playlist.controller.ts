import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { musicStore } from '../services/store.service';
import { PlaylistService } from '../services/playlist.service';

export class PlaylistController {
  public static async createPlaylist(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { title, description, coverUrl } = req.body;

      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        res.status(400).json({ error: 'Playlist title is required' });
        return;
      }

      const playlist = PlaylistService.createPlaylist(userId, title, description, coverUrl);
      res.status(201).json({ playlist });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async getMyPlaylists(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const playlists = musicStore.playlists.filter(p => p.userId === userId);

      const enriched = playlists.map(p => {
        const count = musicStore.playlistTracks.filter(pt => pt.playlistId === p.id).length;
        return {
          ...p,
          trackCount: count
        };
      });

      res.status(200).json({ playlists: enriched });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async getPlaylist(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const playlistId = req.params.id as string;
      const playlist = PlaylistService.getPlaylistWithTracks(playlistId);

      if (!playlist) {
        res.status(404).json({ error: 'Playlist not found' });
        return;
      }

      res.status(200).json({ playlist });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async addTrack(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const playlistId = req.params.id as string;
      const { trackId } = req.body;

      if (!trackId) {
        res.status(400).json({ error: 'trackId is required' });
        return;
      }

      const playlistTrack = PlaylistService.addTrack(playlistId, trackId);
      res.status(201).json({ message: 'Track added to playlist', playlistTrack });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async removeTrack(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const playlistId = req.params.id as string;
      const trackId = req.params.trackId as string;

      const success = PlaylistService.removeTrack(playlistId, trackId);
      if (success) {
        res.status(200).json({ message: 'Track removed from playlist' });
      } else {
        res.status(404).json({ error: 'Track not found in playlist' });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async reorderTracks(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const playlistId = req.params.id as string;
      const { sourceIndex, targetIndex } = req.body;

      if (typeof sourceIndex !== 'number' || typeof targetIndex !== 'number') {
        res.status(400).json({ error: 'sourceIndex and targetIndex must be numbers' });
        return;
      }

      const reordered = PlaylistService.reorderTrack(playlistId, sourceIndex, targetIndex);
      res.status(200).json({ message: 'Playlist reordered', tracks: reordered });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Internal server error' });
    }
  }
}
