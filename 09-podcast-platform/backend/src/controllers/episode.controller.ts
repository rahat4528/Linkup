import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { EpisodeModel } from '../types';
import { ChapterService } from '../services/chapter.service';
import { mockPodcasts } from './podcast.controller';

export const mockEpisodes = new Map<string, EpisodeModel>();
const chapterService = new ChapterService();

// Seed initial episodes
const ep1: EpisodeModel = {
  id: 'ep-webrtc-media',
  podcastId: 'pod-arch-tomorrow',
  title: 'Episode 1: The Evolution of WebRTC & Realtime Media',
  description: 'Understanding SFU vs MCU architectures, ICE candidate negotiation, and browser codecs.',
  episodeNumber: 1,
  seasonNumber: 1,
  audioUrl: 'https://cdn.linkup.local/media/aot-ep1.mp3',
  durationSeconds: 2740.0,
  fileSize: 65760000,
  mimeType: 'audio/mpeg',
  status: 'PUBLISHED',
  explicit: false,
  playCount: 4200,
  publishedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  createdAt: new Date().toISOString(),
  chapters: [
    { id: 'ch-1', title: 'Introduction & State of Realtime', startTimeSeconds: 0, endTimeSeconds: 320 },
    { id: 'ch-2', title: 'Signaling and ICE Trickle Mechanics', startTimeSeconds: 320, endTimeSeconds: 1140 },
    { id: 'ch-3', title: 'Selective Forwarding Units (SFU) Deep Dive', startTimeSeconds: 1140, endTimeSeconds: 2100 },
    { id: 'ch-4', title: 'Future of WebTransport and Media Over QUIC', startTimeSeconds: 2100, endTimeSeconds: 2740 }
  ]
};

const ep2: EpisodeModel = {
  id: 'ep-event-driven',
  podcastId: 'pod-arch-tomorrow',
  title: 'Episode 2: Scaling Event-Driven Systems with Kafka and BullMQ',
  description: 'Practical patterns for transactional outbox, deduplication, and backpressure handling.',
  episodeNumber: 2,
  seasonNumber: 1,
  audioUrl: 'https://cdn.linkup.local/media/aot-ep2.mp3',
  durationSeconds: 3120.0,
  fileSize: 74880000,
  mimeType: 'audio/mpeg',
  status: 'PUBLISHED',
  explicit: false,
  playCount: 3150,
  publishedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  createdAt: new Date().toISOString(),
  chapters: []
};

mockEpisodes.set(ep1.id, ep1);
mockEpisodes.set(ep2.id, ep2);

export class EpisodeController {
  public async getEpisodesByPodcast(req: Request, res: Response) {
    const { podcastId } = req.params;
    const episodes = Array.from(mockEpisodes.values()).filter((e) => e.podcastId === podcastId);
    return res.status(200).json({ episodes, total: episodes.length });
  }

  public async getEpisodeById(req: Request, res: Response) {
    const { id } = req.params;
    const episode = mockEpisodes.get(id as string);

    if (!episode) {
      return res.status(404).json({ error: 'Episode not found' });
    }

    return res.status(200).json({ episode });
  }

  public async createEpisode(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        podcastId,
        title,
        description,
        episodeNumber,
        seasonNumber,
        audioUrl,
        durationSeconds,
        fileSize,
        mimeType,
        explicit,
        status,
        chapters
      } = req.body;

      if (!podcastId || !title || !audioUrl) {
        return res.status(400).json({ error: 'podcastId, title, and audioUrl are required' });
      }

      const podcast = mockPodcasts.get(podcastId);
      if (!podcast) {
        return res.status(404).json({ error: 'Podcast not found' });
      }

      const dur = durationSeconds || 1800.0;
      let processedChapters: any[] = [];

      if (chapters && Array.isArray(chapters)) {
        const chapterResult = chapterService.processChapters(chapters, dur);
        if (!chapterResult.valid) {
          return res.status(400).json({ error: chapterResult.error });
        }
        processedChapters = chapterResult.chapters;
      }

      const id = `ep-${Date.now()}`;
      const newEpisode: EpisodeModel = {
        id,
        podcastId,
        title,
        description: description || '',
        episodeNumber: episodeNumber || 1,
        seasonNumber: seasonNumber || 1,
        audioUrl,
        durationSeconds: dur,
        fileSize: fileSize || 45000000,
        mimeType: mimeType || 'audio/mpeg',
        status: status || 'PUBLISHED',
        explicit: explicit ?? false,
        playCount: 0,
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        chapters: processedChapters
      };

      mockEpisodes.set(id, newEpisode);
      return res.status(201).json({ episode: newEpisode });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to create episode', details: err.message });
    }
  }
}
