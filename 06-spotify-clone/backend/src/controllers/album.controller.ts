import { Request, Response } from 'express';
import { musicStore, MusicAlbum } from '../services/store.service';

export class AlbumController {
  public static async getAlbum(req: Request, res: Response): Promise<void> {
    try {
      const albumId = req.params.id as string;
      const album = musicStore.albums.find(a => a.id === albumId);

      if (!album) {
        res.status(404).json({ error: 'Album not found' });
        return;
      }

      const artist = musicStore.artists.find(art => art.id === album.artistId);
      const tracks = musicStore.tracks
        .filter(t => t.albumId === albumId)
        .sort((a, b) => a.trackNumber - b.trackNumber);

      res.status(200).json({
        album: {
          ...album,
          artistName: artist?.name || 'Unknown Artist',
          tracks
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async createAlbum(req: Request, res: Response): Promise<void> {
    try {
      const { title, artistId, coverUrl, releaseYear } = req.body;

      if (!title || !artistId) {
        res.status(400).json({ error: 'title and artistId are required' });
        return;
      }

      const album: MusicAlbum = {
        id: 'alb_' + Math.random().toString(36).substring(2, 9),
        title,
        artistId,
        coverUrl,
        releaseYear: releaseYear || 2026,
        createdAt: new Date()
      };

      musicStore.albums.push(album);
      res.status(201).json({ album });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
}
