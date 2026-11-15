import { QueueService } from '../../src/services/queue.service';
import { MusicTrack } from '../../src/services/store.service';

describe('QueueService Repeat Modes', () => {
  let queue: QueueService;
  const mockTracks: MusicTrack[] = [
    { id: 't1', artistId: 'a1', title: 'Track 1', durationMs: 180000, audioUrl: 't1.mp3', trackNumber: 1, createdAt: new Date() },
    { id: 't2', artistId: 'a1', title: 'Track 2', durationMs: 190000, audioUrl: 't2.mp3', trackNumber: 2, createdAt: new Date() }
  ];

  beforeEach(() => {
    queue = new QueueService();
  });

  it('should stop playback after last track when repeatMode is OFF', () => {
    queue.playContext(mockTracks[0], mockTracks);
    queue.setRepeatMode('OFF');

    expect(queue.next()?.id).toBe('t2');
    expect(queue.next()).toBeNull();
  });

  it('should loop current track indefinitely when repeatMode is ONE', () => {
    queue.playContext(mockTracks[0], mockTracks);
    queue.setRepeatMode('ONE');

    expect(queue.next()?.id).toBe('t1');
    expect(queue.next()?.id).toBe('t1');
  });

  it('should loop entire playlist back to beginning when repeatMode is ALL', () => {
    queue.playContext(mockTracks[0], mockTracks);
    queue.setRepeatMode('ALL');

    expect(queue.next()?.id).toBe('t2');
    // Loops back to first track
    const looped = queue.next();
    expect(looped).not.toBeNull();
    expect(looped?.id).toBe('t1');
  });
});
