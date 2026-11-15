import { RssGeneratorService } from '../../src/services/rss-generator.service';
import { PodcastModel, EpisodeModel } from '../../src/types';

describe('RssGeneratorService - RSS 2.0 XML Feed Serialization', () => {
  let service: RssGeneratorService;

  const mockPodcast: PodcastModel = {
    id: 'test-pod',
    title: 'Code & Systems <Special>',
    slug: 'code-systems',
    description: 'Weekly tech engineering discourse & analysis.',
    author: 'Dev Host & Team',
    coverUrl: 'https://example.com/cover.jpg',
    category: 'Technology',
    language: 'en',
    explicit: false,
    websiteUrl: 'https://example.com/podcast',
    creatorId: 'user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockEpisodes: EpisodeModel[] = [
    {
      id: 'ep-1',
      podcastId: 'test-pod',
      title: 'Distributed Consensus & Raft',
      description: 'Understanding consensus algorithms in modern databases.',
      episodeNumber: 1,
      seasonNumber: 1,
      audioUrl: 'https://cdn.example.com/audio/ep1.mp3',
      durationSeconds: 3665.0, // 1h 1m 5s
      fileSize: 88000000,
      mimeType: 'audio/mpeg',
      status: 'PUBLISHED',
      explicit: false,
      playCount: 150,
      publishedAt: '2026-03-01T12:00:00Z',
      createdAt: '2026-03-01T10:00:00Z'
    },
    {
      id: 'ep-draft',
      podcastId: 'test-pod',
      title: 'Unpublished Draft Episode',
      description: 'Not yet released',
      audioUrl: 'https://cdn.example.com/audio/draft.mp3',
      durationSeconds: 1200.0,
      fileSize: 20000000,
      mimeType: 'audio/mpeg',
      status: 'DRAFT',
      explicit: false,
      playCount: 0,
      publishedAt: '2026-03-05T12:00:00Z',
      createdAt: '2026-03-05T10:00:00Z'
    }
  ];

  beforeEach(() => {
    service = new RssGeneratorService();
  });

  it('should generate valid RSS 2.0 XML with enclosure tags', () => {
    const xml = service.generateFeedXml(mockPodcast, mockEpisodes);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain('<title>Code &amp; Systems &lt;Special&gt;</title>');
    expect(xml).toContain('<enclosure url="https://cdn.example.com/audio/ep1.mp3" length="88000000" type="audio/mpeg" />');
    expect(xml).toContain('<itunes:duration>01:01:05</itunes:duration>');
    expect(xml).toContain('<itunes:explicit>no</itunes:explicit>');
  });

  it('should exclude DRAFT episodes from public RSS feed', () => {
    const xml = service.generateFeedXml(mockPodcast, mockEpisodes);
    expect(xml).toContain('Distributed Consensus &amp; Raft');
    expect(xml).not.toContain('Unpublished Draft Episode');
  });

  it('should properly format durations in MM:SS and HH:MM:SS', () => {
    expect(service.formatDuration(125)).toBe('02:05');
    expect(service.formatDuration(3600)).toBe('01:00:00');
    expect(service.formatDuration(3665)).toBe('01:01:05');
  });

  it('should escape XML entities correctly', () => {
    const unescaped = '<hello> & "world" \'quote\'';
    const escaped = service.escapeXml(unescaped);
    expect(escaped).toBe('&lt;hello&gt; &amp; &quot;world&quot; &apos;quote&apos;');
  });
});
