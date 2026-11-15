export interface PodcastModel {
  id: string;
  title: string;
  slug: string;
  description: string;
  author: string;
  coverUrl: string;
  category: string;
  language: string;
  explicit: boolean;
  websiteUrl?: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChapterItem {
  id: string;
  title: string;
  startTimeSeconds: number;
  endTimeSeconds?: number;
  url?: string;
}

export interface EpisodeModel {
  id: string;
  podcastId: string;
  title: string;
  description: string;
  episodeNumber?: number;
  seasonNumber?: number;
  audioUrl: string;
  durationSeconds: number;
  fileSize: number;
  mimeType: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED';
  explicit: boolean;
  playCount: number;
  publishedAt: string;
  createdAt: string;
  chapters?: ChapterItem[];
}
