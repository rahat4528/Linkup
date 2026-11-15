export interface OutgoingMail {
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text?: string;
  html?: string;
  inReplyTo?: string;
  references?: string[];
  attachments?: {
    filename: string;
    content: string; // Base64 or utf8
    contentType: string;
  }[];
}

export interface IncomingMail {
  messageId: string;
  from: string;
  to: string[];
  cc?: string[];
  subject: string;
  text?: string;
  html?: string;
  inReplyTo?: string;
  references?: string[];
  date: Date;
  attachments?: {
    filename: string;
    size: number;
    contentType: string;
  }[];
}

export interface IMailProvider {
  sendMail(mail: OutgoingMail): Promise<{ success: boolean; messageId: string }>;
  fetchNewMails(since?: Date): Promise<IncomingMail[]>;
}
