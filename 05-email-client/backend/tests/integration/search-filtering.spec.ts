const request = require('supertest');
import { createApp } from '../../src/app';
import { emailStore } from '../../src/services/store.service';
import { MailService } from '../../src/services/mail.service';

describe('Email Search and Filtering API Integration', () => {
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
        email: 'searcher@linkup.test',
        username: 'searcher',
        password: 'password123',
        name: 'Email Searcher'
      });
    userToken = res.body.token;
    userId = res.body.user.id;
  });

  it('should search emails across subject, sender, body text, and labels', async () => {
    // Thread 1
    await MailService.ingestIncomingMail(userId, {
      messageId: '<inv_1@vendor.local>',
      from: 'billing@accounting.local',
      to: ['searcher@linkup.test'],
      subject: 'Invoice #9482 for Server Infrastructure',
      text: 'Total due is $1,250.00 for October.',
      date: new Date()
    });

    // Thread 2
    await MailService.ingestIncomingMail(userId, {
      messageId: '<inv_2@vendor.local>',
      from: 'hr@company.local',
      to: ['searcher@linkup.test'],
      subject: 'Holiday schedule update',
      text: 'Offices will be closed during Christmas.',
      date: new Date()
    });

    // Search by subject keyword
    const searchSubject = await request(app)
      .get('/api/search?q=invoice')
      .set('Authorization', `Bearer ${userToken}`);

    expect(searchSubject.status).toBe(200);
    expect(searchSubject.body.count).toBe(1);
    expect(searchSubject.body.threads[0].normalizedSubject).toContain('Invoice');

    // Search by sender keyword
    const searchSender = await request(app)
      .get('/api/search?q=accounting.local')
      .set('Authorization', `Bearer ${userToken}`);

    expect(searchSender.status).toBe(200);
    expect(searchSender.body.count).toBe(1);

    // Search by body keyword
    const searchBody = await request(app)
      .get('/api/search?q=Christmas')
      .set('Authorization', `Bearer ${userToken}`);

    expect(searchBody.status).toBe(200);
    expect(searchBody.body.count).toBe(1);
    expect(searchBody.body.threads[0].normalizedSubject).toContain('Holiday');
  });
});
