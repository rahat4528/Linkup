import { Response } from 'express';
import { AuthenticatedInstaRequest } from '../middleware/auth.middleware';
import { instaStore } from '../services/store.service';
import { HashtagService } from '../services/hashtag.service';
import { PrivacyService } from '../services/privacy.service';

export class ExploreController {
  static getExplore(req: AuthenticatedInstaRequest, res: Response): void {
    const viewerId = req.user ? req.user.id : null;

    // Explore posts: public accounts in READY status
    const publicPosts = instaStore.posts
      .filter((p) => p.status === 'READY')
      .filter((p) => {
        const authorProfile = instaStore.profiles.find((prof) => prof.userId === p.authorId);
        return !authorProfile || !authorProfile.isPrivate;
      })
      .filter((p) => (viewerId ? !PrivacyService.isBlocked(viewerId, p.authorId) : true))
      .map((p) => ({
        id: p.id,
        caption: p.caption,
        media: p.media,
        likesCount: instaStore.reactions.filter((r) => r.postId === p.id).length,
        commentsCount: instaStore.comments.filter((c) => c.postId === p.id).length,
      }));

    const trendingTags = HashtagService.getTrending(6, 24);

    res.status(200).json({
      explore: publicPosts,
      trendingTags,
    });
  }

  static getTagFeed(req: AuthenticatedInstaRequest, res: Response): void {
    const rawTag = req.params.hashtag as string;
    const cleanTag = rawTag.replace('#', '').toLowerCase();

    const matchingPosts = instaStore.posts
      .filter((p) => p.status === 'READY')
      .filter((p) => p.caption && p.caption.toLowerCase().includes(`#${cleanTag}`))
      .map((p) => ({
        id: p.id,
        caption: p.caption,
        media: p.media,
        likesCount: instaStore.reactions.filter((r) => r.postId === p.id).length,
      }));

    const hashtag = instaStore.hashtags.find((h) => h.tag === cleanTag);

    res.status(200).json({
      tag: cleanTag,
      postsCount: hashtag?.postsCount || matchingPosts.length,
      posts: matchingPosts,
    });
  }
}
