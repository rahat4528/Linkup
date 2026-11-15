export interface TrackItem {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  albumId?: string;
  albumTitle?: string;
  albumCoverUrl?: string;
  durationMs: number;
  audioUrl: string;
}

export interface AlbumItem {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  coverUrl: string;
  releaseYear: number;
  tracks: TrackItem[];
}

export interface ArtistItem {
  id: string;
  name: string;
  avatarUrl: string;
  bio?: string;
}

export interface IMusicCatalogProvider {
  search(query: string): Promise<{ tracks: TrackItem[]; albums: AlbumItem[]; artists: ArtistItem[] }>;
  getTrack(trackId: string): Promise<TrackItem | null>;
  getAlbum(albumId: string): Promise<AlbumItem | null>;
}

export interface IPlaybackAdapter {
  resolveStreamUrl(trackId: string): Promise<string>;
}
