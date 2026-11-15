import { ThreadingService } from '../../src/services/threading.service';
import { emailStore } from '../../src/services/store.service';

describe('ThreadingService RFC Chaining & Normalization', () => {
  beforeEach(() => {
    emailStore.clear();
  });

  it('should normalize subjects by stripping prefixes', () => {
    expect(ThreadingService.normalizeSubject('Re: Project Status')).toBe('Project Status');
    expect(ThreadingService.normalizeSubject('Fwd: Re: [EXTERNAL] Quarterly Report')).toBe('Quarterly Report');
    expect(ThreadingService.normalizeSubject('   RE:   FWD: Meeting Notes   ')).toBe('Meeting Notes');
    expect(ThreadingService.normalizeSubject('')).toBe('(No Subject)');
  });

  it('should group reply into existing thread using inReplyTo', () => {
    const thread1 = ThreadingService.resolveThread('usr_1', 'Budget Planning');
    emailStore.messages.push({
      id: 'msg_1',
      threadId: thread1.id,
      messageId: '<root_budget@linkup.local>',
      from: 'boss@linkup.local',
      to: ['usr_1@linkup.local'],
      cc: [],
      bcc: [],
      subject: 'Budget Planning',
      references: [],
      isDraft: false,
      date: new Date(),
      createdAt: new Date()
    });

    // In-reply-to root_budget
    const thread2 = ThreadingService.resolveThread(
      'usr_1',
      'Re: Budget Planning',
      '<root_budget@linkup.local>',
      ['<root_budget@linkup.local>']
    );

    expect(thread2.id).toBe(thread1.id);
  });

  it('should group into existing thread using references array', () => {
    const thread1 = ThreadingService.resolveThread('usr_1', 'Security Audit');
    emailStore.messages.push({
      id: 'msg_sec_1',
      threadId: thread1.id,
      messageId: '<audit_root@linkup.local>',
      from: 'sec@linkup.local',
      to: ['usr_1@linkup.local'],
      cc: [],
      bcc: [],
      subject: 'Security Audit',
      references: [],
      isDraft: false,
      date: new Date(),
      createdAt: new Date()
    });

    const thread2 = ThreadingService.resolveThread(
      'usr_1',
      'Security Audit Followup',
      undefined,
      ['<unrelated@linkup.local>', '<audit_root@linkup.local>']
    );

    expect(thread2.id).toBe(thread1.id);
  });

  it('should group by normalized subject fallback when headers are missing', () => {
    const thread1 = ThreadingService.resolveThread('usr_1', 'Weekly Standup');
    const thread2 = ThreadingService.resolveThread('usr_1', 'Re: Weekly Standup');

    expect(thread2.id).toBe(thread1.id);
  });
});
