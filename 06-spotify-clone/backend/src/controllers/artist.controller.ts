import { Request, Response } from 'express';
import { musicStore, MusicArtist } from '../services/store.service';

export class ArtistController {
  public static async getArtist(req: Request, res: Response): Promise<void> {
    try {
      const artistId = req.params.id as string;
      const artist = musicStore.artists.find(a => a.id === artistId);

      if (!artist) {
        res.status(404).json({ error: 'Artist not found' });
        return;
      }

      const albums = musicStore.albums.filter(alb => alb.artistId === artistId);
      const topTracks = musicStore.tracks.filter(t => t.artistId === artistId).slice(0, 10);

      res.status(200).json({
        artist,
        albums,
        topTracks
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async createArtist(req: Request, res: Response): Promise<void> {
    try {
      const { name, avatarUrl, bio } = req.body;

      if (!name) {
        res.status(400).json({ error: 'Artist name is required' });
        return;
      }

      const artist: MusicArtist = {
        id: 'art_' + Math.random().toString(36).substring(2, 9),
        name,
        avatarUrl,
        bio,
        createdAt: new Date()
      };

      musicStore.artists.push(artist);
      res.status(201).json({ artist });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
}
