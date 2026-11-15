import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { PodcastModel } from '../types';

export const mockPodcasts = new Map<string, PodcastModel>();
export const mockSubscriptions = new Set<string>(); // "userId:podcastId"

// Seed default show
const defaultShow: PodcastModel = {
  id: 'pod-arch-tomorrow',
  title: 'Architectures of Tomorrow',
  slug: 'architectures-of-tomorrow',
  description: 'Deep dives into distributed systems, real-time protocols, and engineering scale.',
  author: 'Elena Rostova',
  coverUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&fit=crop',
  category: 'Technology',
  language: 'en',
  explicit: false,
  websiteUrl: 'https://linkup.local/podcasts/architectures-of-tomorrow',
  creatorId: 'user-creator-elena',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
mockPodcasts.set(defaultShow.id, defaultShow);

export class PodcastController {
  public async getPodcasts(req: Request, res: Response) {
    const { category, search } = req.query;
    let podcasts = Array.from(mockPodcasts.values());

    if (category && typeof category === 'string') {
      podcasts = podcasts.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      podcasts = podcasts.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({ podcasts, total: podcasts.length });
  }

  public async getPodcastById(req: Request, res: Response) {
    const { id } = req.params;
    let podcast = mockPodcasts.get(id as string);

    if (!podcast) {
      // Try search by slug
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

    return res.status(200).json({ podcast });
  }

  public async createPodcast(req: AuthenticatedRequest, res: Response) {
    try {
      const { title, description, category, author, coverUrl, language, explicit } = req.body;

      if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
      }

      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const id = `pod-${Date.now()}`;
      const newShow: PodcastModel = {
        id,
        title,
        slug,
        description,
        author: author || req.user?.username || 'Creator',
        coverUrl: coverUrl || 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&fit=crop',
        category: category || 'Technology',
        language: language || 'en',
        explicit: explicit ?? false,
        websiteUrl: `https://linkup.local/podcasts/${slug}`,
        creatorId: req.user?.id || 'anonymous',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockPodcasts.set(id, newShow);
      return res.status(201).json({ podcast: newShow });
    } catch (err: any) {
      return res.status(500).json({ error: 'Podcast creation failed', details: err.message });
    }
  }

  public async toggleSubscription(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const podcast = mockPodcasts.get(id as string);
    if (!podcast) {
      return res.status(404).json({ error: 'Podcast not found' });
    }

    const subKey = `${userId}:${id}`;
    let isSubscribed = false;

    if (mockSubscriptions.has(subKey)) {
      mockSubscriptions.delete(subKey);
      isSubscribed = false;
    } else {
      mockSubscriptions.add(subKey);
      isSubscribed = true;
    }

    return res.status(200).json({ podcastId: id, isSubscribed });
  }
}
