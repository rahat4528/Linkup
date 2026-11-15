const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export interface Post {
  id: string;
  authorId: string;
  text: string;
  conversationId: string;
  parentId?: string | null;
  isDeleted: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    username: string;
    name: string;
    avatarUrl?: string;
  };
  poll?: {
    id: string;
    options: { id: string; text: string; votesCount: number }[];
    totalVotes: number;
    percentages: number[];
  };
  communityNotes?: {
    id: string;
    text: string;
    status: string;
  }[];
  counts?: {
    likes: number;
    reposts: number;
    replies: number;
  };
  userEngagement?: {
    isLiked: boolean;
    isReposted: boolean;
  };
}

export interface TrendingTopic {
  tag: string;
  count: number;
}

export class MicroblogApi {
  private static token: string | null = null;

  public static setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('mb_token', token);
    }
  }

  public static getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('mb_token');
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

  public static async getForYouFeed(): Promise<Post[]> {
    try {
      const res = await fetch(`${API_URL}/api/feed/for-you`, {
        headers: this.getHeaders()
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.posts || [];
    } catch {
      return [];
    }
  }

  public static async getFollowingFeed(): Promise<Post[]> {
    try {
      const res = await fetch(`${API_URL}/api/feed/following`, {
        headers: this.getHeaders()
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.posts || [];
    } catch {
      return [];
    }
  }

  public static async createPost(
    text: string,
    parentId?: string,
    pollOptions?: string[]
  ): Promise<any> {
    const res = await fetch(`${API_URL}/api/posts`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ text, parentId, pollOptions })
    });
    return res.json();
  }

  public static async toggleLike(postId: string): Promise<any> {
    const res = await fetch(`${API_URL}/api/posts/${postId}/like`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    return res.json();
  }

  public static async toggleRepost(postId: string): Promise<any> {
    const res = await fetch(`${API_URL}/api/posts/${postId}/repost`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    return res.json();
  }

  public static async votePoll(pollId: string, optionIndex: number): Promise<any> {
    const res = await fetch(`${API_URL}/api/polls/${pollId}/vote`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ optionIndex })
    });
    return res.json();
  }

  public static async getThread(conversationId: string): Promise<Post[]> {
    try {
      const res = await fetch(`${API_URL}/api/posts/thread/${conversationId}`, {
        headers: this.getHeaders()
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.posts || [];
    } catch {
      return [];
    }
  }

  public static async getTrending(): Promise<TrendingTopic[]> {
    try {
      const res = await fetch(`${API_URL}/api/trending`, {
        headers: this.getHeaders()
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.trending || [];
    } catch {
      return [];
    }
  }

  public static async search(query: string): Promise<{ posts: Post[]; users: any[] }> {
    try {
      const res = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(query)}`, {
        headers: this.getHeaders()
      });
      if (!res.ok) return { posts: [], users: [] };
      return res.json();
    } catch {
      return { posts: [], users: [] };
    }
  }
}
