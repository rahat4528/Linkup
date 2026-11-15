import { IPlaybackAdapter } from './music-provider.interface';

export class PlaybackAdapter implements IPlaybackAdapter {
  private baseStreamUrl: string;

  constructor(baseStreamUrl: string = 'http://localhost:3005/audio') {
    this.baseStreamUrl = baseStreamUrl;
  }

  public async resolveStreamUrl(trackId: string): Promise<string> {
    return `${this.baseStreamUrl}/${encodeURIComponent(trackId)}.mp3`;
  }
}
