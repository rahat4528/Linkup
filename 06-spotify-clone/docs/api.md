# Audio Catalog & Discovery Platform — API Reference

## 1. Authentication
- `POST /api/auth/register` — Register user.
- `POST /api/auth/login` — Login user.

## 2. Catalog & Discovery
- `GET /api/tracks/:id` — Get single track metadata & stream URL.
- `GET /api/albums/:id` — Get album details with tracklist.
- `GET /api/artists/:id` — Get artist profile and top tracks.
- `GET /api/browse/categories` — Get exploration categories.
- `GET /api/search?q={query}` — Search tracks, albums, artists, playlists.

## 3. Playlists
- `GET /api/playlists/me` — List user created playlists.
- `POST /api/playlists` — Create new playlist.
- `GET /api/playlists/:id` — Get playlist with ordered tracks.
- `POST /api/playlists/:id/tracks` — Add track to playlist.
- `DELETE /api/playlists/:id/tracks/:trackId` — Remove track from playlist.
- `PUT /api/playlists/:id/reorder` — Reorder track position (`{ sourceIndex, targetIndex }`).

## 4. User Library
- `GET /api/library/liked-tracks` — List liked songs.
- `POST /api/library/tracks/:id/like` — Toggle like track.
- `GET /api/library/albums` — List saved albums.
- `POST /api/library/albums/:id/save` — Toggle save album.
