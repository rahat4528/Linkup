import { IMusicCatalogProvider, TrackItem, AlbumItem, ArtistItem } from './music-provider.interface';

export class CatalogAdapter implements IMusicCatalogProvider {
  private tracks: TrackItem[] = [];
  private albums: AlbumItem[] = [];
  private artists: ArtistItem[] = [];

  constructor(initialData?: { tracks?: TrackItem[]; albums?: AlbumItem[]; artists?: ArtistItem[] }) {
    if (initialData?.tracks) this.tracks = initialData.tracks;
    if (initialData?.albums) this.albums = initialData.albums;
    if (initialData?.artists) this.artists = initialData.artists;
  }

  public async search(query: string): Promise<{ tracks: TrackItem[]; albums: AlbumItem[]; artists: ArtistItem[] }> {
    const q = query.toLowerCase();
    const matchedTracks = this.tracks.filter(t => t.title.toLowerCase().includes(q) || t.artistName.toLowerCase().includes(q));
    const matchedAlbums = this.albums.filter(a => a.title.toLowerCase().includes(q) || a.artistName.toLowerCase().includes(q));
    const matchedArtists = this.artists.filter(art => art.name.toLowerCase().includes(q));

    return {
      tracks: matchedTracks,
      albums: matchedAlbums,
      artists: matchedArtists
    };
  }

  public async getTrack(trackId: string): Promise<TrackItem | null> {
    return this.tracks.find(t => t.id === trackId) || null;
  }

  public async getAlbum(albumId: string): Promise<AlbumItem | null> {
    return this.albums.find(a => a.id === albumId) || null;
  }
}
