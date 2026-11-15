export interface InstaUser {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InstaProfile {
  id: string;
  userId: string;
  avatarUrl?: string;
  bio?: string;
  website?: string;
  isPrivate: boolean;
  isVerified: boolean;
}

export interface InstaFollow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface InstaFollowRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  createdAt: Date;
}

export interface InstaPostMedia {
  id: string;
  postId: string;
  url: string;
  thumbnailUrl?: string;
  type: 'IMAGE' | 'VIDEO';
  order: number;
}

export interface InstaPost {
  id: string;
  authorId: string;
  caption?: string;
  location?: string;
  status: 'PROCESSING' | 'READY' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
  media: InstaPostMedia[];
}

export interface InstaHashtag {
  id: string;
  tag: string;
  postsCount: number;
  lastUsedAt: Date;
}

export interface InstaReaction {
  id: string;
  userId: string;
  postId: string;
  createdAt: Date;
}

export interface InstaComment {
  id: string;
  authorId: string;
  postId: string;
  content: string;
  createdAt: Date;
}

export interface InstaStory {
  id: string;
  authorId: string;
  mediaUrl: string;
  caption?: string;
  audience: 'EVERYONE' | 'CLOSE_FRIENDS';
  createdAt: Date;
  expiresAt: Date;
}

export interface InstaStoryView {
  id: string;
  storyId: string;
  viewerId: string;
  viewedAt: Date;
}

export interface InstaReel {
  id: string;
  authorId: string;
  videoUrl: string;
  caption?: string;
  audioTrack: string;
  viewsCount: number;
  likesCount: number;
  createdAt: Date;
}

export interface InstaDirectMessage {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

export interface InstaBlock {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: Date;
}

export interface InstaReport {
  id: string;
  reporterId: string;
  targetId: string;
  reason: string;
  status: 'PENDING' | 'RESOLVED';
  createdAt: Date;
}

class InMemoryInstaStore {
  users: InstaUser[] = [];
  profiles: InstaProfile[] = [];
  follows: InstaFollow[] = [];
  followRequests: InstaFollowRequest[] = [];
  posts: InstaPost[] = [];
  hashtags: InstaHashtag[] = [];
  reactions: InstaReaction[] = [];
  comments: InstaComment[] = [];
  stories: InstaStory[] = [];
  storyViews: InstaStoryView[] = [];
  reels: InstaReel[] = [];
  messages: InstaDirectMessage[] = [];
  blocks: InstaBlock[] = [];
  reports: InstaReport[] = [];

  clear() {
    this.users = [];
    this.profiles = [];
    this.follows = [];
    this.followRequests = [];
    this.posts = [];
    this.hashtags = [];
    this.reactions = [];
    this.comments = [];
    this.stories = [];
    this.storyViews = [];
    this.reels = [];
    this.messages = [];
    this.blocks = [];
    this.reports = [];
  }
}

export const instaStore = new InMemoryInstaStore();
