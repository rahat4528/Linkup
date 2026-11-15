import { emailStore, EmailMessage, EmailThread } from './store.service';
import { ThreadingService } from './threading.service';

export interface DraftPayload {
  draftId?: string;
  to?: string[];
  cc?: string[];
  bcc?: string[];
  subject?: string;
  bodyText?: string;
  bodyHtml?: string;
  inReplyTo?: string;
  references?: string[];
}

export class DraftService {
  /**
   * Autosaves a draft for the user. Atomically updates if draftId exists, else creates new.
   */
  public static autosave(userId: string, payload: DraftPayload): { draft: EmailMessage; thread: EmailThread } {
    let thread: EmailThread;
    let draft: EmailMessage;

    if (payload.draftId) {
      // Find existing draft
      const existingMsg = emailStore.messages.find(m => m.id === payload.draftId && m.isDraft);
      if (existingMsg) {
        existingMsg.to = payload.to || existingMsg.to;
        existingMsg.cc = payload.cc || existingMsg.cc;
        existingMsg.bcc = payload.bcc || existingMsg.bcc;
        existingMsg.subject = payload.subject || existingMsg.subject;
        existingMsg.bodyText = payload.bodyText !== undefined ? payload.bodyText : existingMsg.bodyText;
        existingMsg.bodyHtml = payload.bodyHtml !== undefined ? payload.bodyHtml : existingMsg.bodyHtml;
        existingMsg.date = new Date();

        thread = emailStore.threads.find(t => t.id === existingMsg.threadId)!;
        ThreadingService.updateThreadOnMessage(thread, existingMsg);

        return { draft: existingMsg, thread };
      }
    }

    // Create new draft
    thread = ThreadingService.resolveThread(
      userId,
      payload.subject || '(Draft)',
      payload.inReplyTo,
      payload.references || [],
      'DRAFTS'
    );
    thread.folder = 'DRAFTS';

    const draftId = 'dft_' + Math.random().toString(36).substring(2, 9);
    draft = {
      id: draftId,
      threadId: thread.id,
      messageId: `<draft_${draftId}@linkup.local>`,
      from: userId,
      to: payload.to || [],
      cc: payload.cc || [],
      bcc: payload.bcc || [],
      subject: payload.subject || '(Draft)',
      bodyText: payload.bodyText || '',
      bodyHtml: payload.bodyHtml || '',
      inReplyTo: payload.inReplyTo,
      references: payload.references || [],
      isDraft: true,
      date: new Date(),
      createdAt: new Date()
    };

    emailStore.messages.push(draft);
    ThreadingService.updateThreadOnMessage(thread, draft);

    return { draft, thread };
  }

  /**
   * Discards a draft.
   */
  public static discardDraft(userId: string, draftId: string): boolean {
    const idx = emailStore.messages.findIndex(m => m.id === draftId && m.isDraft);
    if (idx === -1) return false;

    const draft = emailStore.messages[idx];
    emailStore.messages.splice(idx, 1);

    // If thread has no more messages, remove thread
    const remainingMessages = emailStore.messages.filter(m => m.threadId === draft.threadId);
    if (remainingMessages.length === 0) {
      const threadIdx = emailStore.threads.findIndex(t => t.id === draft.threadId);
      if (threadIdx !== -1) {
        emailStore.threads.splice(threadIdx, 1);
      }
    }

    return true;
  }
}
