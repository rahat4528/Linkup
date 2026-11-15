import { musicStore, MusicTrack, MusicAlbum, MusicArtist, MusicPlaylist } from './store.service';

export interface BrowseCategory {
  id: string;
  name: string;
  gradient: string;
}

export class CatalogService {
  public static readonly CATEGORIES: BrowseCategory[] = [
    { id: 'pop', name: 'Pop', gradient: 'from-pink-500 to-rose-600' },
    { id: 'hiphop', name: 'Hip-Hop', gradient: 'from-orange-500 to-amber-600' },
    { id: 'electronic', name: 'Electronic / Dance', gradient: 'from-cyan-500 to-blue-600' },
    { id: 'rock', name: 'Rock', gradient: 'from-red-600 to-neutral-800' },
    { id: 'indie', name: 'Indie & Alternative', gradient: 'from-emerald-500 to-teal-700' },
    { id: 'chill', name: 'Chill & Focus', gradient: 'from-indigo-500 to-purple-600' },
    { id: 'rnb', name: 'R&B / Soul', gradient: 'from-amber-600 to-yellow-600' },
    { id: 'jazz', name: 'Jazz & Classical', gradient: 'from-teal-600 to-cyan-800' }
  ];

  public static search(query: string): {
    tracks: MusicTrack[];
    albums: MusicAlbum[];
    artists: MusicArtist[];
    playlists: MusicPlaylist[];
  } {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { tracks: [], albums: [], artists: [], playlists: [] };
    }

    const tracks = musicStore.tracks.filter(t => t.title.toLowerCase().includes(q));
    const albums = musicStore.albums.filter(a => a.title.toLowerCase().includes(q));
    const artists = musicStore.artists.filter(art => art.name.toLowerCase().includes(q));
    const playlists = musicStore.playlists.filter(
      p => p.isPublic && p.title.toLowerCase().includes(q)
    );

    return { tracks, albums, artists, playlists };
  }
}
