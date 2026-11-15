const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
import { AuthController } from './controllers/auth.controller';
import { TrackController } from './controllers/track.controller';
import { AlbumController } from './controllers/album.controller';
import { ArtistController } from './controllers/artist.controller';
import { PlaylistController } from './controllers/playlist.controller';
import { LibraryController } from './controllers/library.controller';
import { SearchController } from './controllers/search.controller';
import { authMiddleware } from './middleware/auth.middleware';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Health
  app.get('/health', (req: any, res: any) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // Auth
  app.post('/api/auth/register', AuthController.register);
  app.post('/api/auth/login', AuthController.login);

  // Catalog
  app.get('/api/tracks/:id', TrackController.getTrack);
  app.post('/api/tracks', TrackController.createTrack);
  app.get('/api/albums/:id', AlbumController.getAlbum);
  app.post('/api/albums', AlbumController.createAlbum);
  app.get('/api/artists/:id', ArtistController.getArtist);
  app.post('/api/artists', ArtistController.createArtist);

  // Browse & Search
  app.get('/api/browse/categories', SearchController.getCategories);
  app.get('/api/search', SearchController.search);

  // Playlists
  app.get('/api/playlists/me', authMiddleware, PlaylistController.getMyPlaylists);
  app.post('/api/playlists', authMiddleware, PlaylistController.createPlaylist);
  app.get('/api/playlists/:id', PlaylistController.getPlaylist);
  app.post('/api/playlists/:id/tracks', authMiddleware, PlaylistController.addTrack);
  app.delete('/api/playlists/:id/tracks/:trackId', authMiddleware, PlaylistController.removeTrack);
  app.put('/api/playlists/:id/reorder', authMiddleware, PlaylistController.reorderTracks);

  // Library
  app.get('/api/library/liked-tracks', authMiddleware, LibraryController.getLikedTracks);
  app.post('/api/library/tracks/:id/like', authMiddleware, LibraryController.toggleLikeTrack);
  app.get('/api/library/albums', authMiddleware, LibraryController.getSavedAlbums);
  app.post('/api/library/albums/:id/save', authMiddleware, LibraryController.toggleSaveAlbum);

  return app;
};
