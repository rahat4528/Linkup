const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

export interface Track {
  id: string;
  title: string;
  artistId: string;
  artistName?: string;
  albumId?: string;
  albumTitle?: string;
  coverUrl?: string;
  durationMs: number;
  audioUrl: string;
  position?: number;
}

export interface Playlist {
  id: string;
  userId: string;
  title: string;
  description?: string;
  coverUrl?: string;
  isPublic: boolean;
  trackCount?: number;
  tracks?: Track[];
}

export interface Category {
  id: string;
  name: string;
  gradient: string;
}

export class SpotifyApi {
  private static token: string | null = null;

  public static setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('spotify_token', token);
    }
  }

  public static getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('spotify_token');
    }
    return this.token;
  }

  private static getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  public static async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch(`${API_URL}/api/browse/categories`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.categories || [];
    } catch {
      return [];
    }
  }

  public static async getMyPlaylists(): Promise<Playlist[]> {
    try {
      const res = await fetch(`${API_URL}/api/playlists/me`, { headers: this.getHeaders() });
      if (!res.ok) return [];
      const data = await res.json();
      return data.playlists || [];
    } catch {
      return [];
    }
  }

  public static async getPlaylist(playlistId: string): Promise<Playlist | null> {
    try {
      const res = await fetch(`${API_URL}/api/playlists/${playlistId}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.playlist || null;
    } catch {
      return null;
    }
  }

  public static async createPlaylist(title: string, description?: string): Promise<any> {
    const res = await fetch(`${API_URL}/api/playlists`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ title, description })
    });
    return res.json();
  }

  public static async reorderPlaylist(playlistId: string, sourceIndex: number, targetIndex: number): Promise<any> {
    const res = await fetch(`${API_URL}/api/playlists/${playlistId}/reorder`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ sourceIndex, targetIndex })
    });
    return res.json();
  }

  public static async getLikedTracks(): Promise<Track[]> {
    try {
      const res = await fetch(`${API_URL}/api/library/liked-tracks`, { headers: this.getHeaders() });
      if (!res.ok) return [];
      const data = await res.json();
      return data.tracks || [];
    } catch {
      return [];
    }
  }

  public static async toggleLikeTrack(trackId: string): Promise<any> {
    const res = await fetch(`${API_URL}/api/library/tracks/${trackId}/like`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    return res.json();
  }

  public static async search(query: string): Promise<any> {
    try {
      const res = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) return { results: { tracks: [], albums: [], artists: [], playlists: [] } };
      return res.json();
    } catch {
      return { results: { tracks: [], albums: [], artists: [], playlists: [] } };
    }
  }
}
