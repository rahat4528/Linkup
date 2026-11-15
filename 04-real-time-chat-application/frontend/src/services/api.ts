const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  avatarUrl?: string;
  presence?: 'ONLINE' | 'OFFLINE';
}

export interface Conversation {
  id: string;
  type: 'DIRECT' | 'GROUP';
  title?: string;
  avatarUrl?: string;
  members: {
    userId: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
    name: string;
    username: string;
    avatarUrl?: string;
  }[];
  lastMessage?: {
    id: string;
    senderId: string;
    content: string;
    createdAt: string;
  } | null;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderUsername: string;
  content: string;
  isDeleted: boolean;
  isEdited: boolean;
  clientMessageId?: string;
  createdAt: string;
  receiptStatus: 'SENT' | 'DELIVERED' | 'READ';
  reactions?: {
    userId: string;
    emoji: string;
  }[];
}

export class ChatApi {
  private static token: string | null = null;

  public static setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('chat_token', token);
    }
  }

  public static getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('chat_token');
    }
    return this.token;
  }

  private static getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  public static async getConversations(): Promise<Conversation[]> {
    try {
      const res = await fetch(`${API_URL}/api/conversations`, {
        headers: this.getHeaders()
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.conversations || [];
    } catch {
      return [];
    }
  }

  public static async getMessages(conversationId: string, since?: string): Promise<Message[]> {
    try {
      const url = since
        ? `${API_URL}/api/conversations/${conversationId}/messages?since=${encodeURIComponent(since)}`
        : `${API_URL}/api/conversations/${conversationId}/messages`;

      const res = await fetch(url, { headers: this.getHeaders() });
      if (!res.ok) return [];
      const data = await res.json();
      return data.messages || [];
    } catch {
      return [];
    }
  }

  public static async sendMessage(conversationId: string, content: string): Promise<any> {
    const res = await fetch(`${API_URL}/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ content })
    });
    return res.json();
  }

  public static async createDirect(targetUserId: string): Promise<any> {
    const res = await fetch(`${API_URL}/api/conversations/direct`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ targetUserId })
    });
    return res.json();
  }

  public static async createGroup(title: string, memberUserIds: string[]): Promise<any> {
    const res = await fetch(`${API_URL}/api/conversations/group`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ title, memberUserIds })
    });
    return res.json();
  }

  public static async toggleReaction(messageId: string, emoji: string): Promise<any> {
    const res = await fetch(`${API_URL}/api/messages/${messageId}/reactions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ emoji })
    });
    return res.json();
  }

  public static async deleteMessage(messageId: string): Promise<any> {
    const res = await fetch(`${API_URL}/api/messages/${messageId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return res.json();
  }

  public static async searchMessages(query: string): Promise<any> {
    try {
      const res = await fetch(`${API_URL}/api/search/messages?q=${encodeURIComponent(query)}`, {
        headers: this.getHeaders()
      });
      if (!res.ok) return { messages: [] };
      return res.json();
    } catch {
      return { messages: [] };
    }
  }

  public static async searchUsers(query: string): Promise<User[]> {
    try {
      const res = await fetch(`${API_URL}/api/search/users?q=${encodeURIComponent(query)}`, {
        headers: this.getHeaders()
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.users || [];
    } catch {
      return [];
    }
  }
}
