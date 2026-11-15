import { Request, Response } from 'express';
import { RssGeneratorService } from '../services/rss-generator.service';
import { RssParserService } from '../services/rss-parser.service';
import { mockPodcasts } from './podcast.controller';
import { mockEpisodes } from './episode.controller';

const rssGenerator = new RssGeneratorService();
const rssParser = new RssParserService();

export class FeedController {
  public async getPodcastFeedXml(req: Request, res: Response) {
    const { id } = req.params;
    let podcast = mockPodcasts.get(id as string);

    if (!podcast) {
      for (const p of mockPodcasts.values()) {
        if (p.slug === id) {
          podcast = p;
          break;
        }
      }
    }

    if (!podcast) {
      return res.status(404).json({ error: 'Podcast not found' });
    }

    const episodes = Array.from(mockEpisodes.values()).filter((e) => e.podcastId === podcast!.id);
    const xml = rssGenerator.generateFeedXml(podcast, episodes);

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.status(200).send(xml);
  }

  public async validateExternalFeed(req: Request, res: Response) {
    const { feedUrl } = req.body;

    if (!feedUrl) {
      return res.status(400).json({ error: 'feedUrl is required' });
    }

    const safety = rssParser.isSafeUrl(feedUrl);
    if (!safety.isSafe) {
      return res.status(400).json({
        valid: false,
        ssrfBlocked: true,
        reason: safety.reason
      });
    }

    return res.status(200).json({
      valid: true,
      ssrfBlocked: false,
      feedUrl,
      message: 'Feed URL is safe and valid'
    });
  }
}
