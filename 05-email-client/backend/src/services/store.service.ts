export type EmailFolder = 'INBOX' | 'SENT' | 'DRAFTS' | 'TRASH' | 'SPAM' | 'ARCHIVE';

export interface EmailUser {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  name: string;
  createdAt: Date;
}

export interface EmailThread {
  id: string;
  userId: string;
  normalizedSubject: string;
  snippet: string;
  lastMessageAt: Date;
  isStarred: boolean;
  isRead: boolean;
  folder: EmailFolder;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailMessage {
  id: string;
  threadId: string;
  messageId: string;
  from: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  bodyText?: string;
  bodyHtml?: string;
  inReplyTo?: string;
  references: string[];
  isDraft: boolean;
  date: Date;
  createdAt: Date;
}

export interface EmailLabel {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface EmailLabelAssignment {
  id: string;
  threadId: string;
  labelId: string;
}

class InMemoryEmailStore {
  users: EmailUser[] = [];
  threads: EmailThread[] = [];
  messages: EmailMessage[] = [];
  labels: EmailLabel[] = [];
  labelAssignments: EmailLabelAssignment[] = [];

  clear() {
    this.users = [];
    this.threads = [];
    this.messages = [];
    this.labels = [];
    this.labelAssignments = [];
  }
}

export const emailStore = new InMemoryEmailStore();
