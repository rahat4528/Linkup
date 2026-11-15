import { emailStore, EmailThread, EmailMessage, EmailFolder } from './store.service';

export class ThreadingService {
  /**
   * Normalizes an email subject by stripping Re:, Fwd:, etc.
   */
  public static normalizeSubject(subject: string): string {
    if (!subject) return '(No Subject)';
    // Strip prefixes like Re:, Fwd:, FW:, [EXTERNAL], etc.
    let cleaned = subject.trim();
    const prefixRegex = /^(\[\s*external\s*\]\s*|(re|fwd|fw)\s*:\s*)+/i;
    while (prefixRegex.test(cleaned)) {
      cleaned = cleaned.replace(prefixRegex, '').trim();
    }
    return cleaned || '(No Subject)';
  }

  /**
   * Resolves or creates an EmailThread for an incoming or outgoing message.
   */
  public static resolveThread(
    userId: string,
    subject: string,
    inReplyTo?: string,
    references: string[] = [],
    folder: EmailFolder = 'INBOX'
  ): EmailThread {
    const normalized = this.normalizeSubject(subject);

    // 1. Try matching by inReplyTo
    if (inReplyTo) {
      const parentMsg = emailStore.messages.find(m => m.messageId === inReplyTo);
      if (parentMsg) {
        const thread = emailStore.threads.find(t => t.id === parentMsg.threadId && t.userId === userId);
        if (thread) return thread;
      }
    }

    // 2. Try matching by references
    if (references && references.length > 0) {
      for (const ref of references) {
        const refMsg = emailStore.messages.find(m => m.messageId === ref);
        if (refMsg) {
          const thread = emailStore.threads.find(t => t.id === refMsg.threadId && t.userId === userId);
          if (thread) return thread;
        }
      }
    }

    // 3. Try matching by normalized subject for the same user
    const existingThread = emailStore.threads.find(
      t => t.userId === userId && t.normalizedSubject.toLowerCase() === normalized.toLowerCase()
    );
    if (existingThread) {
      return existingThread;
    }

    // 4. Create new thread
    const threadId = 'thrd_' + Math.random().toString(36).substring(2, 9);
    const newThread: EmailThread = {
      id: threadId,
      userId,
      normalizedSubject: normalized,
      snippet: '',
      lastMessageAt: new Date(),
      isStarred: false,
      isRead: false,
      folder,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    emailStore.threads.push(newThread);
    return newThread;
  }

  /**
   * Updates thread metadata when a message is added.
   */
  public static updateThreadOnMessage(thread: EmailThread, message: EmailMessage): void {
    const rawSnippet = message.bodyText || message.bodyHtml?.replace(/<[^>]*>/g, '') || '';
    thread.snippet = rawSnippet.substring(0, 150).trim();
    thread.lastMessageAt = message.date;
    thread.updatedAt = new Date();
  }
}
