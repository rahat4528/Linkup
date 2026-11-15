const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002/api/v1';

class InstaApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('linkup_insta_token', token);
      } else {
        localStorage.removeItem('linkup_insta_token');
      }
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('linkup_insta_token');
    }
    return this.token;
  }

  async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  register(data: any) {
    return this.request('/auth/register', { method: 'POST', body: JSON.stringify(data) });
  }

  login(data: any) {
    return this.request('/auth/login', { method: 'POST', body: JSON.stringify(data) });
  }

  getFeed() {
    return this.request('/posts/feed');
  }

  createPost(data: any) {
    return this.request('/posts', { method: 'POST', body: JSON.stringify(data) });
  }

  toggleLike(postId: string) {
    return this.request(`/posts/${postId}/like`, { method: 'POST' });
  }

  addComment(postId: string, content: string) {
    return this.request(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ content }) });
  }

  getStories() {
    return this.request('/stories');
  }

  createStory(mediaUrl: string, caption?: string) {
    return this.request('/stories', { method: 'POST', body: JSON.stringify({ mediaUrl, caption }) });
  }

  getReels() {
    return this.request('/reels/feed');
  }

  createReel(data: any) {
    return this.request('/reels', { method: 'POST', body: JSON.stringify(data) });
  }

  getExplore() {
    return this.request('/explore');
  }

  getProfile(username: string) {
    return this.request(`/profiles/${username}`);
  }

  updateProfile(data: any) {
    return this.request('/profiles/me', { method: 'PATCH', body: JSON.stringify(data) });
  }

  followUser(userId: string) {
    return this.request(`/users/${userId}/follow`, { method: 'POST' });
  }

  unfollowUser(userId: string) {
    return this.request(`/users/${userId}/follow`, { method: 'DELETE' });
  }
}

export const api = new InstaApiClient();
