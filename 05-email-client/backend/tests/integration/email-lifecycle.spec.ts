const request = require('supertest');
import { createApp } from '../../src/app';
import { emailStore } from '../../src/services/store.service';
import { MailService } from '../../src/services/mail.service';

describe('Email Lifecycle API Integration', () => {
  let app: any;
  let userToken: string;
  let userId: string;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(async () => {
    emailStore.clear();

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'user@linkup.test',
        username: 'linkup_user',
        password: 'password123',
        name: 'Linkup Tester'
      });
    userToken = res.body.token;
    userId = res.body.user.id;
  });

  it('should send email and list in SENT folder', async () => {
    const sendRes = await request(app)
      .post('/api/emails/send')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        to: ['colleague@linkup.test'],
        subject: 'Quarterly review report',
        text: 'Attached is the quarterly report.',
        html: '<p>Attached is the quarterly report.</p>'
      });

    expect(sendRes.status).toBe(201);
    expect(sendRes.body.email.subject).toBe('Quarterly review report');

    const listRes = await request(app)
      .get('/api/emails?folder=SENT')
      .set('Authorization', `Bearer ${userToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.threads.length).toBe(1);
    expect(listRes.body.threads[0].normalizedSubject).toBe('Quarterly review report');
  });

  it('should toggle star, toggle read, and move to folder', async () => {
    // Ingest an incoming mail
    const { thread } = await MailService.ingestIncomingMail(userId, {
      messageId: '<in_123@remote.local>',
      from: 'partner@remote.local',
      to: ['user@linkup.test'],
      subject: 'Contract discussion',
      text: 'Please review the agreement.',
      date: new Date()
    });

    // Toggle star
    const starRes = await request(app)
      .patch(`/api/emails/${thread.id}/star`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(starRes.status).toBe(200);
    expect(starRes.body.isStarred).toBe(true);

    // Toggle read
    const readRes = await request(app)
      .patch(`/api/emails/${thread.id}/read`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ isRead: true });
    expect(readRes.status).toBe(200);
    expect(readRes.body.isRead).toBe(true);

    // Move to ARCHIVE
    const archiveRes = await request(app)
      .patch(`/api/emails/${thread.id}/folder`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ folder: 'ARCHIVE' });
    expect(archiveRes.status).toBe(200);
    expect(archiveRes.body.thread.folder).toBe('ARCHIVE');
  });

  it('should retrieve full thread and mark as read automatically', async () => {
    const { thread } = await MailService.ingestIncomingMail(userId, {
      messageId: '<root_thread@remote.local>',
      from: 'dev@remote.local',
      to: ['user@linkup.test'],
      subject: 'Architecture review',
      text: 'First message',
      date: new Date()
    });

    expect(thread.isRead).toBe(false);

    const threadRes = await request(app)
      .get(`/api/threads/${thread.id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(threadRes.status).toBe(200);
    expect(threadRes.body.messages.length).toBe(1);
    expect(threadRes.body.thread.isRead).toBe(true);
  });
});
