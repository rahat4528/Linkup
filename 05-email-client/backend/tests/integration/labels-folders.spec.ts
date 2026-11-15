const request = require('supertest');
import { createApp } from '../../src/app';
import { emailStore } from '../../src/services/store.service';
import { MailService } from '../../src/services/mail.service';

describe('Labels and Folder Taxonomy API Integration', () => {
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
        email: 'labeluser@linkup.test',
        username: 'labeluser',
        password: 'password123',
        name: 'Label User'
      });
    userToken = res.body.token;
    userId = res.body.user.id;
  });

  it('should create custom label, assign to thread, and filter', async () => {
    // 1. Create label
    const labelRes = await request(app)
      .post('/api/labels')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Urgent', color: '#ef4444' });

    expect(labelRes.status).toBe(201);
    const labelId = labelRes.body.label.id;

    // 2. Ingest email thread
    const { thread } = await MailService.ingestIncomingMail(userId, {
      messageId: '<urgent_doc@remote.local>',
      from: 'boss@remote.local',
      to: ['labeluser@linkup.test'],
      subject: 'Critical Deadline',
      text: 'Submit before 5pm.',
      date: new Date()
    });

    // 3. Assign label
    const assignRes = await request(app)
      .post(`/api/emails/${thread.id}/labels`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ labelId });

    expect(assignRes.status).toBe(200);

    // 4. Query emails by labelId
    const filterRes = await request(app)
      .get(`/api/emails?labelId=${labelId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(filterRes.status).toBe(200);
    expect(filterRes.body.threads.length).toBe(1);
    expect(filterRes.body.threads[0].labels[0].name).toBe('Urgent');

    // 5. Remove label
    const removeRes = await request(app)
      .delete(`/api/emails/${thread.id}/labels/${labelId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(removeRes.status).toBe(200);

    // Verify filter returns 0
    const filterAfter = await request(app)
      .get(`/api/emails?labelId=${labelId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(filterAfter.body.threads.length).toBe(0);
  });
});
