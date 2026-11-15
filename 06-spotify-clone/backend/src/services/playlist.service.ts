import {
  musicStore,
  MusicPlaylist,
  MusicPlaylistTrack,
  MusicTrack
} from './store.service';

export class PlaylistService {
  public static createPlaylist(
    userId: string,
    title: string,
    description?: string,
    coverUrl?: string
  ): MusicPlaylist {
    const playlistId = 'pl_' + Math.random().toString(36).substring(2, 9);
    const playlist: MusicPlaylist = {
      id: playlistId,
      userId,
      title: title.trim(),
      description,
      coverUrl,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    musicStore.playlists.push(playlist);
    return playlist;
  }

  public static addTrack(playlistId: string, trackId: string): MusicPlaylistTrack {
    const playlist = musicStore.playlists.find(p => p.id === playlistId);
    if (!playlist) throw new Error('Playlist not found');

    const track = musicStore.tracks.find(t => t.id === trackId);
    if (!track) throw new Error('Track not found');

    const existingTracks = musicStore.playlistTracks
      .filter(pt => pt.playlistId === playlistId)
      .sort((a, b) => a.position - b.position);

    const nextPosition = existingTracks.length > 0
      ? existingTracks[existingTracks.length - 1].position + 1
      : 0;

    const playlistTrack: MusicPlaylistTrack = {
      id: 'pt_' + Math.random().toString(36).substring(2, 9),
      playlistId,
      trackId,
      position: nextPosition,
      addedAt: new Date()
    };

    musicStore.playlistTracks.push(playlistTrack);
    playlist.updatedAt = new Date();
    return playlistTrack;
  }

  public static removeTrack(playlistId: string, trackId: string): boolean {
    const idx = musicStore.playlistTracks.findIndex(
      pt => pt.playlistId === playlistId && pt.trackId === trackId
    );
    if (idx === -1) return false;

    musicStore.playlistTracks.splice(idx, 1);
    this.compactPositions(playlistId);
    return true;
  }

  /**
   * Reorders track from sourceIndex to targetIndex, compacting positions deterministically.
   */
  public static reorderTrack(
    playlistId: string,
    sourceIndex: number,
    targetIndex: number
  ): MusicPlaylistTrack[] {
    const tracks = musicStore.playlistTracks
      .filter(pt => pt.playlistId === playlistId)
      .sort((a, b) => a.position - b.position);

    if (
      sourceIndex < 0 ||
      sourceIndex >= tracks.length ||
      targetIndex < 0 ||
      targetIndex >= tracks.length
    ) {
      throw new Error('Index out of bounds for playlist reorder');
    }

    const [moved] = tracks.splice(sourceIndex, 1);
    tracks.splice(targetIndex, 0, moved);

    // Reassign continuous 0..n-1 positions
    tracks.forEach((pt, index) => {
      pt.position = index;
    });

    return tracks;
  }

  private static compactPositions(playlistId: string): void {
    const tracks = musicStore.playlistTracks
      .filter(pt => pt.playlistId === playlistId)
      .sort((a, b) => a.position - b.position);

    tracks.forEach((pt, index) => {
      pt.position = index;
    });
  }

  public static getPlaylistWithTracks(playlistId: string): (MusicPlaylist & { tracks: (MusicTrack & { position: number })[] }) | null {
    const playlist = musicStore.playlists.find(p => p.id === playlistId);
    if (!playlist) return null;

    const pts = musicStore.playlistTracks
      .filter(pt => pt.playlistId === playlistId)
      .sort((a, b) => a.position - b.position);

    const enrichedTracks = pts.map(pt => {
      const track = musicStore.tracks.find(t => t.id === pt.trackId)!;
      return {
        ...track,
        position: pt.position
      };
    });

    return {
      ...playlist,
      tracks: enrichedTracks
    };
  }
}
