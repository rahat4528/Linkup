import { QueueService } from '../../src/services/queue.service';
import { MusicTrack } from '../../src/services/store.service';

describe('QueueService & Fisher-Yates Shuffling', () => {
  let queue: QueueService;
  const mockTracks: MusicTrack[] = [
    { id: 't1', artistId: 'a1', title: 'Track 1', durationMs: 180000, audioUrl: 't1.mp3', trackNumber: 1, createdAt: new Date() },
    { id: 't2', artistId: 'a1', title: 'Track 2', durationMs: 190000, audioUrl: 't2.mp3', trackNumber: 2, createdAt: new Date() },
    { id: 't3', artistId: 'a1', title: 'Track 3', durationMs: 200000, audioUrl: 't3.mp3', trackNumber: 3, createdAt: new Date() },
    { id: 't4', artistId: 'a1', title: 'Track 4', durationMs: 210000, audioUrl: 't4.mp3', trackNumber: 4, createdAt: new Date() }
  ];

  beforeEach(() => {
    queue = new QueueService();
  });

  it('should play context and dequeue sequential tracks', () => {
    queue.playContext(mockTracks[0], mockTracks);
    expect(queue.getQueueState().currentTrack?.id).toBe('t1');

    const next1 = queue.next();
    expect(next1?.id).toBe('t2');

    const next2 = queue.next();
    expect(next2?.id).toBe('t3');
  });

  it('should prioritize Up Next user-queued tracks before context tracks', () => {
    queue.playContext(mockTracks[0], mockTracks);

    const bonusTrack: MusicTrack = {
      id: 'bonus_1',
      artistId: 'a2',
      title: 'Bonus User Pick',
      durationMs: 150000,
      audioUrl: 'bonus.mp3',
      trackNumber: 1,
      createdAt: new Date()
    };

    queue.enqueueUpNext(bonusTrack);

    // Next track must be the user-queued bonus track, not t2
    const nextTrack = queue.next();
    expect(nextTrack?.id).toBe('bonus_1');

    // Subsequent track should resume context (t2)
    const subsequentTrack = queue.next();
    expect(subsequentTrack?.id).toBe('t2');
  });

  it('should shuffle queue using Fisher-Yates and restore original order upon unshuffle', () => {
    queue.playContext(mockTracks[0], mockTracks);

    // Context queue initially has [t2, t3, t4]
    expect(queue.getQueueState().contextQueue.map(t => t.id)).toEqual(['t2', 't3', 't4']);

    // Toggle shuffle ON
    queue.toggleShuffle();
    expect(queue.getQueueState().isShuffled).toBe(true);
    expect(queue.getQueueState().contextQueue.length).toBe(3);

    // Toggle shuffle OFF -> must restore original sequential order [t2, t3, t4]
    queue.toggleShuffle();
    expect(queue.getQueueState().isShuffled).toBe(false);
    expect(queue.getQueueState().contextQueue.map(t => t.id)).toEqual(['t2', 't3', 't4']);
  });
});
