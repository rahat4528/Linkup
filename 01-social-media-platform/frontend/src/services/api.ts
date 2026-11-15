const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('linkup_social_token', token);
      } else {
        localStorage.removeItem('linkup_social_token');
      }
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('linkup_social_token');
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

  // Auth
  register(data: any) {
    return this.request('/auth/register', { method: 'POST', body: JSON.stringify(data) });
  }

  login(data: any) {
    return this.request('/auth/login', { method: 'POST', body: JSON.stringify(data) });
  }

  // User
  getMe() {
    return this.request('/users/me');
  }

  updateProfile(data: any) {
    return this.request('/users/me/profile', { method: 'PATCH', body: JSON.stringify(data) });
  }

  // Posts & Feed
  getFeed(mode: 'ranked' | 'chronological' = 'ranked', cursor?: string) {
    const query = new URLSearchParams({ mode });
    if (cursor) query.append('cursor', cursor);
    return this.request(`/posts/feed?${query.toString()}`);
  }

  createPost(data: any) {
    return this.request('/posts', { method: 'POST', body: JSON.stringify(data) });
  }

  reactToPost(postId: string, type: string) {
    return this.request(`/posts/${postId}/reactions`, { method: 'POST', body: JSON.stringify({ type }) });
  }

  removeReaction(postId: string) {
    return this.request(`/posts/${postId}/reactions`, { method: 'DELETE' });
  }

  addComment(postId: string, content: string, parentId?: string) {
    return this.request(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ content, parentId }) });
  }

  // Groups
  getGroups() {
    return this.request('/groups');
  }

  createGroup(data: any) {
    return this.request('/groups', { method: 'POST', body: JSON.stringify(data) });
  }

  joinGroup(groupId: string) {
    return this.request(`/groups/${groupId}/join`, { method: 'POST' });
  }

  // Events
  getEvents() {
    return this.request('/events');
  }

  createEvent(data: any) {
    return this.request('/events', { method: 'POST', body: JSON.stringify(data) });
  }

  rsvpEvent(eventId: string, status: string) {
    return this.request(`/events/${eventId}/rsvp`, { method: 'POST', body: JSON.stringify({ status }) });
  }

  // Stories
  getStories() {
    return this.request('/stories');
  }

  createStory(mediaUrl: string, caption?: string) {
    return this.request('/stories', { method: 'POST', body: JSON.stringify({ mediaUrl, caption }) });
  }

  // Friends & Safety
  getFriends() {
    return this.request('/friends');
  }

  getSuggestions() {
    return this.request('/friends/suggestions');
  }

  sendFriendRequest(targetUserId: string) {
    return this.request(`/friends/request/${targetUserId}`, { method: 'POST' });
  }

  blockUser(targetUserId: string) {
    return this.request(`/blocks/${targetUserId}`, { method: 'POST' });
  }

  reportContent(targetType: string, targetId: string, reason: string, description?: string) {
    return this.request('/reports', { method: 'POST', body: JSON.stringify({ targetType, targetId, reason, description }) });
  }

  getNotifications() {
    return this.request('/notifications');
  }
}

export const api = new ApiClient();
