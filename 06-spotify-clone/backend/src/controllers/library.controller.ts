import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { musicStore, MusicLikedTrack, MusicSavedAlbum } from '../services/store.service';

export class LibraryController {
  public static async getLikedTracks(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const likes = musicStore.likedTracks
        .filter(l => l.userId === userId)
        .sort((a, b) => b.likedAt.getTime() - a.likedAt.getTime());

      const tracks = likes.map(l => {
        const track = musicStore.tracks.find(t => t.id === l.trackId)!;
        const artist = musicStore.artists.find(a => a.id === track.artistId);
        const album = track.albumId ? musicStore.albums.find(a => a.id === track.albumId) : null;
        return {
          ...track,
          artistName: artist?.name || 'Unknown Artist',
          albumTitle: album?.title,
          coverUrl: album?.coverUrl,
          likedAt: l.likedAt
        };
      });

      res.status(200).json({ tracks });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async toggleLikeTrack(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const trackId = req.params.id as string;

      const track = musicStore.tracks.find(t => t.id === trackId);
      if (!track) {
        res.status(404).json({ error: 'Track not found' });
        return;
      }

      const existingIndex = musicStore.likedTracks.findIndex(
        l => l.userId === userId && l.trackId === trackId
      );

      if (existingIndex !== -1) {
        musicStore.likedTracks.splice(existingIndex, 1);
        res.status(200).json({ message: 'Track unliked', liked: false });
      } else {
        const liked: MusicLikedTrack = {
          id: 'like_' + Math.random().toString(36).substring(2, 9),
          userId,
          trackId,
          likedAt: new Date()
        };
        musicStore.likedTracks.push(liked);
        res.status(200).json({ message: 'Track liked', liked: true });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async getSavedAlbums(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const saved = musicStore.savedAlbums
        .filter(s => s.userId === userId)
        .sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());

      const albums = saved.map(s => {
        const album = musicStore.albums.find(a => a.id === s.albumId)!;
        const artist = musicStore.artists.find(a => a.id === album.artistId);
        return {
          ...album,
          artistName: artist?.name || 'Unknown Artist',
          savedAt: s.savedAt
        };
      });

      res.status(200).json({ albums });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async toggleSaveAlbum(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const albumId = req.params.id as string;

      const album = musicStore.albums.find(a => a.id === albumId);
      if (!album) {
        res.status(404).json({ error: 'Album not found' });
        return;
      }

      const existingIndex = musicStore.savedAlbums.findIndex(
        s => s.userId === userId && s.albumId === albumId
      );

      if (existingIndex !== -1) {
        musicStore.savedAlbums.splice(existingIndex, 1);
        res.status(200).json({ message: 'Album removed from library', saved: false });
      } else {
        const saved: MusicSavedAlbum = {
          id: 'save_' + Math.random().toString(36).substring(2, 9),
          userId,
          albumId,
          savedAt: new Date()
        };
        musicStore.savedAlbums.push(saved);
        res.status(200).json({ message: 'Album saved to library', saved: true });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
}
