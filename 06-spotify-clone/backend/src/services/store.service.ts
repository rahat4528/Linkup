export interface MusicUser {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  name: string;
  createdAt: Date;
}

export interface MusicArtist {
  id: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: Date;
}

export interface MusicAlbum {
  id: string;
  artistId: string;
  title: string;
  coverUrl?: string;
  releaseYear: number;
  createdAt: Date;
}

export interface MusicTrack {
  id: string;
  albumId?: string;
  artistId: string;
  title: string;
  durationMs: number;
  audioUrl: string;
  trackNumber: number;
  createdAt: Date;
}

export interface MusicPlaylist {
  id: string;
  userId: string;
  title: string;
  description?: string;
  coverUrl?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MusicPlaylistTrack {
  id: string;
  playlistId: string;
  trackId: string;
  position: number;
  addedAt: Date;
}

export interface MusicLikedTrack {
  id: string;
  userId: string;
  trackId: string;
  likedAt: Date;
}

export interface MusicSavedAlbum {
  id: string;
  userId: string;
  albumId: string;
  savedAt: Date;
}

class InMemoryMusicStore {
  users: MusicUser[] = [];
  artists: MusicArtist[] = [];
  albums: MusicAlbum[] = [];
  tracks: MusicTrack[] = [];
  playlists: MusicPlaylist[] = [];
  playlistTracks: MusicPlaylistTrack[] = [];
  likedTracks: MusicLikedTrack[] = [];
  savedAlbums: MusicSavedAlbum[] = [];

  clear() {
    this.users = [];
    this.artists = [];
    this.albums = [];
    this.tracks = [];
    this.playlists = [];
    this.playlistTracks = [];
    this.likedTracks = [];
    this.savedAlbums = [];
  }
}

export const musicStore = new InMemoryMusicStore();
