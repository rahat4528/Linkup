import { PlaylistService } from '../../src/services/playlist.service';
import { musicStore } from '../../src/services/store.service';

describe('PlaylistService Deterministic Reordering', () => {
  beforeEach(() => {
    musicStore.clear();

    // Create playlist
    musicStore.playlists.push({
      id: 'pl_1',
      userId: 'usr_1',
      title: 'Workout Beats',
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create 4 tracks
    for (let i = 1; i <= 4; i++) {
      musicStore.tracks.push({
        id: `trk_${i}`,
        artistId: 'art_1',
        title: `Track ${i}`,
        durationMs: 180000,
        audioUrl: `trk_${i}.mp3`,
        trackNumber: i,
        createdAt: new Date()
      });
      PlaylistService.addTrack('pl_1', `trk_${i}`);
    }
  });

  it('should initialize tracks with sequential position indexes 0, 1, 2, 3', () => {
    const playlist = PlaylistService.getPlaylistWithTracks('pl_1');
    expect(playlist!.tracks.map(t => t.position)).toEqual([0, 1, 2, 3]);
    expect(playlist!.tracks.map(t => t.id)).toEqual(['trk_1', 'trk_2', 'trk_3', 'trk_4']);
  });

  it('should move track forward from index 0 to index 2 and reindex continuous positions', () => {
    // Move trk_1 from pos 0 to pos 2
    PlaylistService.reorderTrack('pl_1', 0, 2);

    const playlist = PlaylistService.getPlaylistWithTracks('pl_1');
    expect(playlist!.tracks.map(t => t.id)).toEqual(['trk_2', 'trk_3', 'trk_1', 'trk_4']);
    expect(playlist!.tracks.map(t => t.position)).toEqual([0, 1, 2, 3]);
  });

  it('should move track backward from index 3 to index 1 and reindex', () => {
    // Move trk_4 from pos 3 to pos 1
    PlaylistService.reorderTrack('pl_1', 3, 1);

    const playlist = PlaylistService.getPlaylistWithTracks('pl_1');
    expect(playlist!.tracks.map(t => t.id)).toEqual(['trk_1', 'trk_4', 'trk_2', 'trk_3']);
    expect(playlist!.tracks.map(t => t.position)).toEqual([0, 1, 2, 3]);
  });

  it('should remove track and compact remaining positions', () => {
    PlaylistService.removeTrack('pl_1', 'trk_2');

    const playlist = PlaylistService.getPlaylistWithTracks('pl_1');
    expect(playlist!.tracks.map(t => t.id)).toEqual(['trk_1', 'trk_3', 'trk_4']);
    expect(playlist!.tracks.map(t => t.position)).toEqual([0, 1, 2]);
  });
});
