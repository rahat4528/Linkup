import { emailStore, EmailMessage, EmailThread } from './store.service';
import { ThreadingService } from './threading.service';
import { SanitizerService } from './sanitizer.service';
import { SmtpAdapter } from '../../../integrations/smtp.adapter';
import { IncomingMail, OutgoingMail } from '../../../integrations/mail-provider.interface';

export class MailService {
  private static smtpAdapter: SmtpAdapter = new SmtpAdapter({
    host: 'localhost',
    port: 3025,
    secure: false
  });

  public static getSmtpAdapter(): SmtpAdapter {
    return this.smtpAdapter;
  }

  /**
   * Sends an email via SMTP and stores it in the sender's SENT folder.
   */
  public static async sendMail(
    senderUserId: string,
    senderEmail: string,
    outgoing: OutgoingMail,
    draftId?: string
  ): Promise<{ message: EmailMessage; thread: EmailThread }> {
    // Sanitize HTML body
    const sanitizeResult = SanitizerService.sanitize(outgoing.html || '');

    // Send via SMTP adapter
    const sendResult = await this.smtpAdapter.send({
      ...outgoing,
      html: sanitizeResult.sanitizedHtml
    });

    // If this was converted from an existing draft, discard the draft record
    if (draftId) {
      const draftIdx = emailStore.messages.findIndex(m => m.id === draftId && m.isDraft);
      if (draftIdx !== -1) {
        emailStore.messages.splice(draftIdx, 1);
      }
    }

    // Resolve thread in SENT folder
    const thread = ThreadingService.resolveThread(
      senderUserId,
      outgoing.subject,
      outgoing.inReplyTo,
      outgoing.references || [],
      'SENT'
    );
    thread.folder = 'SENT';

    const msgId = 'msg_' + Math.random().toString(36).substring(2, 9);
    const message: EmailMessage = {
      id: msgId,
      threadId: thread.id,
      messageId: sendResult.messageId,
      from: senderEmail,
      to: outgoing.to,
      cc: outgoing.cc || [],
      bcc: outgoing.bcc || [],
      subject: outgoing.subject,
      bodyText: outgoing.text,
      bodyHtml: sanitizeResult.sanitizedHtml,
      inReplyTo: outgoing.inReplyTo,
      references: outgoing.references || [],
      isDraft: false,
      date: new Date(),
      createdAt: new Date()
    };

    emailStore.messages.push(message);
    ThreadingService.updateThreadOnMessage(thread, message);

    return { message, thread };
  }

  /**
   * Ingests an incoming mail into a recipient's INBOX.
   */
  public static async ingestIncomingMail(
    recipientUserId: string,
    mail: IncomingMail
  ): Promise<{ message: EmailMessage; thread: EmailThread }> {
    const sanitizeResult = SanitizerService.sanitize(mail.html || '');

    const thread = ThreadingService.resolveThread(
      recipientUserId,
      mail.subject,
      mail.inReplyTo,
      mail.references || [],
      'INBOX'
    );
    thread.folder = 'INBOX';
    thread.isRead = false;

    const msgId = 'msg_' + Math.random().toString(36).substring(2, 9);
    const message: EmailMessage = {
      id: msgId,
      threadId: thread.id,
      messageId: mail.messageId,
      from: mail.from,
      to: mail.to,
      cc: mail.cc || [],
      bcc: [],
      subject: mail.subject,
      bodyText: mail.text,
      bodyHtml: sanitizeResult.sanitizedHtml,
      inReplyTo: mail.inReplyTo,
      references: mail.references || [],
      isDraft: false,
      date: mail.date,
      createdAt: new Date()
    };

    emailStore.messages.push(message);
    ThreadingService.updateThreadOnMessage(thread, message);

    return { message, thread };
  }
}
