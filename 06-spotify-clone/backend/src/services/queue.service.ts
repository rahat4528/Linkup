import { MusicTrack } from './store.service';

export type RepeatMode = 'OFF' | 'ALL' | 'ONE';

export class QueueService {
  private currentTrack: MusicTrack | null = null;
  private upNextQueue: MusicTrack[] = [];
  private contextQueue: MusicTrack[] = [];
  private originalContextQueue: MusicTrack[] = [];
  private history: MusicTrack[] = [];
  private isShuffled: boolean = false;
  private repeatMode: RepeatMode = 'OFF';

  public playContext(track: MusicTrack, contextTracks: MusicTrack[]): void {
    this.currentTrack = track;
    this.history = [];
    this.upNextQueue = [];

    // Find track index in context and set remaining as contextQueue
    const trackIndex = contextTracks.findIndex(t => t.id === track.id);
    if (trackIndex !== -1) {
      this.originalContextQueue = [...contextTracks.slice(trackIndex + 1)];
      this.contextQueue = [...this.originalContextQueue];
    } else {
      this.originalContextQueue = [...contextTracks];
      this.contextQueue = [...contextTracks];
    }

    if (this.isShuffled) {
      this.applyShuffle();
    }
  }

  public enqueueUpNext(track: MusicTrack): void {
    this.upNextQueue.push(track);
  }

  public next(): MusicTrack | null {
    if (!this.currentTrack) return null;

    if (this.repeatMode === 'ONE') {
      return this.currentTrack;
    }

    this.history.push(this.currentTrack);

    // 1. Check Up Next user queue first
    if (this.upNextQueue.length > 0) {
      this.currentTrack = this.upNextQueue.shift()!;
      return this.currentTrack;
    }

    // 2. Check Context Queue
    if (this.contextQueue.length > 0) {
      this.currentTrack = this.contextQueue.shift()!;
      return this.currentTrack;
    }

    // 3. Repeat ALL loop
    if (this.repeatMode === 'ALL' && (this.history.length > 0 || this.originalContextQueue.length > 0)) {
      const fullContext = [...this.history];
      if (this.isShuffled) {
        this.contextQueue = this.fisherYatesShuffle([...fullContext]);
      } else {
        this.contextQueue = [...fullContext];
      }
      this.history = [];
      this.currentTrack = this.contextQueue.shift() || null;
      return this.currentTrack;
    }

    this.currentTrack = null;
    return null;
  }

  public previous(): MusicTrack | null {
    if (this.history.length === 0) return this.currentTrack;

    if (this.currentTrack) {
      this.contextQueue.unshift(this.currentTrack);
    }

    this.currentTrack = this.history.pop() || null;
    return this.currentTrack;
  }

  public toggleShuffle(): boolean {
    this.isShuffled = !this.isShuffled;

    if (this.isShuffled) {
      this.applyShuffle();
    } else {
      // Restore original sequential order
      const remainingOriginal = this.originalContextQueue.filter(
        orig => this.contextQueue.some(curr => curr.id === orig.id)
      );
      this.contextQueue = remainingOriginal;
    }

    return this.isShuffled;
  }

  private applyShuffle(): void {
    this.contextQueue = this.fisherYatesShuffle([...this.contextQueue]);
  }

  /**
   * True Fisher-Yates (Knuth) uniform shuffle algorithm: O(n).
   */
  public fisherYatesShuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  public setRepeatMode(mode: RepeatMode): RepeatMode {
    this.repeatMode = mode;
    return this.repeatMode;
  }

  public getQueueState() {
    return {
      currentTrack: this.currentTrack,
      upNext: this.upNextQueue,
      contextQueue: this.contextQueue,
      isShuffled: this.isShuffled,
      repeatMode: this.repeatMode
    };
  }
}
