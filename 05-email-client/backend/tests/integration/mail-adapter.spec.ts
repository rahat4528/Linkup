import { SmtpAdapter } from '../../../integrations/smtp.adapter';
import { ImapAdapter } from '../../../integrations/imap.adapter';

describe('Mail Provider Adapters (IMAP & SMTP Contracts)', () => {
  it('should send outgoing email via SmtpAdapter and generate RFC messageId', async () => {
    const smtp = new SmtpAdapter({
      host: 'localhost',
      port: 3025,
      secure: false
    });

    const result = await smtp.send({
      from: 'sender@linkup.local',
      to: ['recipient@linkup.local'],
      subject: 'Test SMTP dispatch',
      text: 'Hello via SMTP!'
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toMatch(/^<msg_\d+_[a-z0-9]+@localhost>$/);
    expect(smtp.getSentMails().length).toBe(1);
  });

  it('should fetch and filter incoming emails via ImapAdapter', async () => {
    const imap = new ImapAdapter({
      host: 'localhost',
      port: 3143,
      tls: false
    });

    const now = new Date();
    const older = new Date(now.getTime() - 10000);

    imap.pushToMailbox({
      messageId: '<msg_old@linkup.local>',
      from: 'news@linkup.local',
      to: ['me@linkup.local'],
      subject: 'Old News',
      date: older
    });

    imap.pushToMailbox({
      messageId: '<msg_new@linkup.local>',
      from: 'urgent@linkup.local',
      to: ['me@linkup.local'],
      subject: 'Urgent Update',
      date: now
    });

    // Fetch all
    const all = await imap.fetchMails();
    expect(all.length).toBe(2);

    // Fetch since now - 5000ms
    const recent = await imap.fetchMails(new Date(now.getTime() - 5000));
    expect(recent.length).toBe(1);
    expect(recent[0].subject).toBe('Urgent Update');
  });
});
