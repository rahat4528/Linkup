import { PodcastModel, EpisodeModel } from '../types';

export class RssGeneratorService {
  /**
   * Escape XML special characters to prevent broken XML serialization
   */
  public escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Format duration in seconds to standard HH:MM:SS or MM:SS
   */
  public formatDuration(seconds: number): string {
    const totalSecs = Math.floor(seconds);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  }

  /**
   * Generate RFC 822 formatted date string
   */
  public formatPubDate(isoDate: string): string {
    return new Date(isoDate).toUTCString();
  }

  /**
   * Generate RSS 2.0 podcast XML document
   */
  public generateFeedXml(podcast: PodcastModel, episodes: EpisodeModel[]): string {
    const publishedEpisodes = episodes
      .filter((e) => e.status === 'PUBLISHED')
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    const latestPubDate = publishedEpisodes.length > 0
      ? this.formatPubDate(publishedEpisodes[0].publishedAt)
      : new Date().toUTCString();

    const episodeItemsXml = publishedEpisodes
      .map((ep) => {
        const enclosureTag = `<enclosure url="${this.escapeXml(ep.audioUrl)}" length="${ep.fileSize}" type="${this.escapeXml(ep.mimeType)}" />`;
        const durationTag = `<itunes:duration>${this.formatDuration(ep.durationSeconds)}</itunes:duration>`;
        const explicitTag = `<itunes:explicit>${ep.explicit ? 'yes' : 'no'}</itunes:explicit>`;
        const episodeNumTag = ep.episodeNumber ? `<itunes:episode>${ep.episodeNumber}</itunes:episode>` : '';
        const seasonNumTag = ep.seasonNumber ? `<itunes:season>${ep.seasonNumber}</itunes:season>` : '';

        return `    <item>
      <title>${this.escapeXml(ep.title)}</title>
      <description><![CDATA[${ep.description}]]></description>
      <pubDate>${this.formatPubDate(ep.publishedAt)}</pubDate>
      <guid isPermaLink="false">${ep.id}</guid>
      ${enclosureTag}
      ${durationTag}
      ${explicitTag}
      ${episodeNumTag}
      ${seasonNumTag}
    </item>`;
      })
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${this.escapeXml(podcast.title)}</title>
    <link>${this.escapeXml(podcast.websiteUrl || '')}</link>
    <language>${this.escapeXml(podcast.language)}</language>
    <description><![CDATA[${podcast.description}]]></description>
    <pubDate>${latestPubDate}</pubDate>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <itunes:author>${this.escapeXml(podcast.author)}</itunes:author>
    <itunes:image href="${this.escapeXml(podcast.coverUrl)}" />
    <itunes:category text="${this.escapeXml(podcast.category)}" />
    <itunes:explicit>${podcast.explicit ? 'yes' : 'no'}</itunes:explicit>
${episodeItemsXml}
  </channel>
</rss>`;
  }
}
