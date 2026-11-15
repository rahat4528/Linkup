import { OutgoingMail } from './mail-provider.interface';

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  auth?: {
    user: string;
    pass: string;
  };
}

export class SmtpAdapter {
  private config: SmtpConfig;
  private sentMails: (OutgoingMail & { messageId: string; sentAt: Date })[] = [];

  constructor(config: SmtpConfig) {
    this.config = config;
  }

  public async send(mail: OutgoingMail): Promise<{ success: boolean; messageId: string }> {
    const domain = this.config.host || 'linkup.local';
    const messageId = `<msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}@${domain}>`;

    const record = {
      ...mail,
      messageId,
      sentAt: new Date()
    };
    this.sentMails.push(record);

    return {
      success: true,
      messageId
    };
  }

  public getSentMails() {
    return this.sentMails;
  }

  public clearSentMails() {
    this.sentMails = [];
  }
}
