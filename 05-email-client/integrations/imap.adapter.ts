import { IncomingMail } from './mail-provider.interface';

export interface ImapConfig {
  host: string;
  port: number;
  tls: boolean;
  auth?: {
    user: string;
    pass: string;
  };
}

export class ImapAdapter {
  private config: ImapConfig;
  private mailbox: IncomingMail[] = [];

  constructor(config: ImapConfig) {
    this.config = config;
  }

  public pushToMailbox(mail: IncomingMail) {
    this.mailbox.push(mail);
  }

  public async fetchMails(since?: Date): Promise<IncomingMail[]> {
    if (!since) {
      return [...this.mailbox];
    }
    return this.mailbox.filter(m => m.date >= since);
  }

  public async markDeleted(messageId: string): Promise<boolean> {
    const idx = this.mailbox.findIndex(m => m.messageId === messageId);
    if (idx !== -1) {
      this.mailbox.splice(idx, 1);
      return true;
    }
    return false;
  }
}
