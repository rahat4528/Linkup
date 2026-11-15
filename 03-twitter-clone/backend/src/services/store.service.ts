export interface TweetUser {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TweetProfile {
  id: string;
  userId: string;
  avatarUrl?: string;
  bannerUrl?: string;
  bio?: string;
  location?: string;
  website?: string;
  pinnedPostId?: string | null;
}

export interface TweetPost {
  id: string;
  authorId: string;
  text: string;
  conversationId: string;
  parentId?: string | null;
  isDeleted: boolean;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TweetFollow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface TweetLike {
  id: string;
  userId: string;
  postId: string;
  createdAt: Date;
}

export interface TweetRepost {
  id: string;
  userId: string;
  postId: string;
  createdAt: Date;
}

export interface TweetQuote {
  id: string;
  userId: string;
  targetPostId: string;
  text: string;
  createdAt: Date;
}

export interface TweetPollOption {
  id: string;
  pollId: string;
  index: number;
  text: string;
  votesCount: number;
}

export interface TweetPoll {
  id: string;
  postId: string;
  expiresAt: Date;
  options: TweetPollOption[];
}

export interface TweetPollVote {
  id: string;
  pollId: string;
  optionIndex: number;
  userId: string;
  createdAt: Date;
}

export interface TweetCommunityNote {
  id: string;
  postId: string;
  authorId: string;
  text: string;
  status: 'NEEDS_MORE_RATINGS' | 'HELPFUL' | 'NOT_HELPFUL';
  createdAt: Date;
}

export interface TweetNoteRating {
  id: string;
  noteId: string;
  userId: string;
  isHelpful: boolean;
  userBias: number; // Historical bias profile [-1, 1]
  createdAt: Date;
}

export interface TweetEditHistory {
  id: string;
  postId: string;
  text: string;
  editedAt: Date;
}

export interface TweetMute {
  id: string;
  muterId: string;
  mutedId: string;
  createdAt: Date;
}

export interface TweetBlock {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: Date;
}

class InMemoryTwitterStore {
  users: TweetUser[] = [];
  profiles: TweetProfile[] = [];
  posts: TweetPost[] = [];
  follows: TweetFollow[] = [];
  likes: TweetLike[] = [];
  reposts: TweetRepost[] = [];
  quotes: TweetQuote[] = [];
  polls: TweetPoll[] = [];
  pollVotes: TweetPollVote[] = [];
  communityNotes: TweetCommunityNote[] = [];
  noteRatings: TweetNoteRating[] = [];
  editHistories: TweetEditHistory[] = [];
  mutes: TweetMute[] = [];
  blocks: TweetBlock[] = [];

  clear() {
    this.users = [];
    this.profiles = [];
    this.posts = [];
    this.follows = [];
    this.likes = [];
    this.reposts = [];
    this.quotes = [];
    this.polls = [];
    this.pollVotes = [];
    this.communityNotes = [];
    this.noteRatings = [];
    this.editHistories = [];
    this.mutes = [];
    this.blocks = [];
  }
}

export const twitterStore = new InMemoryTwitterStore();
