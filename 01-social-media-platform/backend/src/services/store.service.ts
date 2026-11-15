export interface StoredUser {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  name: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredProfile {
  id: string;
  userId: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;
  location?: string;
  education?: string;
  work?: string;
  profilePrivacy: 'PUBLIC' | 'FRIENDS' | 'ONLY_ME';
  allowSearchIndex: boolean;
}

export interface StoredFriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'REQUESTED' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredFriendship {
  id: string;
  userAId: string;
  userBId: string;
  createdAt: Date;
}

export interface StoredFollow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface StoredBlock {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: Date;
}

export interface StoredPost {
  id: string;
  authorId: string;
  content: string;
  visibility: 'PUBLIC' | 'FRIENDS' | 'GROUP_ONLY' | 'ONLY_ME';
  groupId?: string | null;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredReaction {
  id: string;
  userId: string;
  postId: string;
  type: 'LIKE' | 'LOVE' | 'CELEBRATE' | 'INSIGHTFUL' | 'SUPPORT';
  createdAt: Date;
}

export interface StoredComment {
  id: string;
  authorId: string;
  postId: string;
  parentId?: string | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredGroup {
  id: string;
  name: string;
  description?: string;
  bannerUrl?: string;
  privacy: 'PUBLIC' | 'PRIVATE';
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredGroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER';
  joinedAt: Date;
}

export interface StoredEvent {
  id: string;
  title: string;
  description: string;
  location?: string;
  eventDate: Date;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredEventRsvp {
  id: string;
  eventId: string;
  userId: string;
  status: 'GOING' | 'INTERESTED' | 'NOT_GOING';
  createdAt: Date;
}

export interface StoredStory {
  id: string;
  authorId: string;
  mediaUrl: string;
  caption?: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface StoredNotification {
  id: string;
  userId: string;
  actorId: string;
  type: string;
  title: string;
  message: string;
  targetUrl?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface StoredReport {
  id: string;
  reporterId: string;
  targetType: 'POST' | 'COMMENT' | 'USER';
  targetId: string;
  reason: 'SPAM' | 'HARASSMENT' | 'HATE_SPEECH' | 'INAPPROPRIATE' | 'OTHER';
  description?: string;
  status: 'PENDING' | 'REVIEWED' | 'DISMISSED' | 'ACTIONED';
  createdAt: Date;
}

class InMemoryDataStore {
  users: StoredUser[] = [];
  profiles: StoredProfile[] = [];
  friendRequests: StoredFriendRequest[] = [];
  friendships: StoredFriendship[] = [];
  follows: StoredFollow[] = [];
  blocks: StoredBlock[] = [];
  posts: StoredPost[] = [];
  reactions: StoredReaction[] = [];
  comments: StoredComment[] = [];
  groups: StoredGroup[] = [];
  groupMembers: StoredGroupMember[] = [];
  events: StoredEvent[] = [];
  eventRsvps: StoredEventRsvp[] = [];
  stories: StoredStory[] = [];
  notifications: StoredNotification[] = [];
  reports: StoredReport[] = [];

  clear() {
    this.users = [];
    this.profiles = [];
    this.friendRequests = [];
    this.friendships = [];
    this.follows = [];
    this.blocks = [];
    this.posts = [];
    this.reactions = [];
    this.comments = [];
    this.groups = [];
    this.groupMembers = [];
    this.events = [];
    this.eventRsvps = [];
    this.stories = [];
    this.notifications = [];
    this.reports = [];
  }
}

export const memoryStore = new InMemoryDataStore();
