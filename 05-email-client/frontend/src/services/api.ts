const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';

export interface EmailLabel {
  id: string;
  name: string;
  color: string;
}

export interface EmailThread {
  id: string;
  normalizedSubject: string;
  snippet: string;
  folder: 'INBOX' | 'SENT' | 'DRAFTS' | 'TRASH' | 'SPAM' | 'ARCHIVE';
  isStarred: boolean;
  isRead: boolean;
  messageCount: number;
  lastMessageAt: string;
  from: string;
  labels: EmailLabel[];
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
  date: string;
}

export class EmailApi {
  private static token: string | null = null;

  public static setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('email_token', token);
    }
  }

  public static getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('email_token');
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

  public static async listEmails(folder: string = 'INBOX', labelId?: string): Promise<EmailThread[]> {
    try {
      const url = labelId
        ? `${API_URL}/api/emails?labelId=${labelId}`
        : `${API_URL}/api/emails?folder=${folder}`;

      const res = await fetch(url, { headers: this.getHeaders() });
      if (!res.ok) return [];
      const data = await res.json();
      return data.threads || [];
    } catch {
      return [];
    }
  }

  public static async getThreadMessages(threadId: string): Promise<{ thread: EmailThread; messages: EmailMessage[] } | null> {
    try {
      const res = await fetch(`${API_URL}/api/threads/${threadId}`, { headers: this.getHeaders() });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  }

  public static async sendEmail(payload: {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    text?: string;
    html?: string;
    inReplyTo?: string;
    references?: string[];
    draftId?: string;
  }): Promise<any> {
    const res = await fetch(`${API_URL}/api/emails/send`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  }

  public static async autosaveDraft(payload: {
    draftId?: string;
    to?: string[];
    subject?: string;
    bodyText?: string;
    bodyHtml?: string;
  }): Promise<any> {
    const res = await fetch(`${API_URL}/api/drafts`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  }

  public static async toggleStar(threadId: string): Promise<any> {
    const res = await fetch(`${API_URL}/api/emails/${threadId}/star`, {
      method: 'PATCH',
      headers: this.getHeaders()
    });
    return res.json();
  }

  public static async moveToFolder(threadId: string, folder: string): Promise<any> {
    const res = await fetch(`${API_URL}/api/emails/${threadId}/folder`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ folder })
    });
    return res.json();
  }

  public static async listLabels(): Promise<EmailLabel[]> {
    try {
      const res = await fetch(`${API_URL}/api/labels`, { headers: this.getHeaders() });
      if (!res.ok) return [];
      const data = await res.json();
      return data.labels || [];
    } catch {
      return [];
    }
  }

  public static async search(query: string): Promise<EmailThread[]> {
    try {
      const res = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(query)}`, {
        headers: this.getHeaders()
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.threads || [];
    } catch {
      return [];
    }
  }
}
