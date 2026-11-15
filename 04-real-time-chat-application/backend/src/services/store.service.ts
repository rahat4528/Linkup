export interface ChatUser {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  name: string;
  avatarUrl?: string;
  createdAt: Date;
}

export type ConversationType = 'DIRECT' | 'GROUP';
export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';
export type ReceiptStatus = 'SENT' | 'DELIVERED' | 'READ';

export interface ChatConversation {
  id: string;
  type: ConversationType;
  title?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMember {
  id: string;
  conversationId: string;
  userId: string;
  role: MemberRole;
  joinedAt: Date;
  lastReadAt?: Date | null;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isDeleted: boolean;
  isEdited: boolean;
  clientMessageId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatReceipt {
  id: string;
  messageId: string;
  userId: string;
  status: ReceiptStatus;
  updatedAt: Date;
}

export interface ChatReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
}

export interface ChatPresence {
  userId: string;
  status: 'ONLINE' | 'OFFLINE';
  lastHeartbeatAt: Date;
}

export interface ChatTyping {
  conversationId: string;
  userId: string;
  expiresAt: Date;
}

class InMemoryChatStore {
  users: ChatUser[] = [];
  conversations: ChatConversation[] = [];
  members: ChatMember[] = [];
  messages: ChatMessage[] = [];
  receipts: ChatReceipt[] = [];
  reactions: ChatReaction[] = [];
  presences: ChatPresence[] = [];
  typings: ChatTyping[] = [];

  clear() {
    this.users = [];
    this.conversations = [];
    this.members = [];
    this.messages = [];
    this.receipts = [];
    this.reactions = [];
    this.presences = [];
    this.typings = [];
  }
}

export const chatStore = new InMemoryChatStore();
