import { DraftService } from '../../src/services/draft.service';
import { emailStore } from '../../src/services/store.service';

describe('DraftService Autosave Engine', () => {
  beforeEach(() => {
    emailStore.clear();
  });

  it('should create initial draft in DRAFTS folder', () => {
    const { draft, thread } = DraftService.autosave('usr_1', {
      to: ['client@example.com'],
      subject: 'Proposal draft',
      bodyText: 'First revision draft'
    });

    expect(draft.isDraft).toBe(true);
    expect(thread.folder).toBe('DRAFTS');
    expect(emailStore.messages.length).toBe(1);
    expect(draft.bodyText).toBe('First revision draft');
  });

  it('should update existing draft atomically without creating orphan records', () => {
    const firstSave = DraftService.autosave('usr_1', {
      to: ['client@example.com'],
      subject: 'Proposal draft',
      bodyText: 'First revision draft'
    });

    const draftId = firstSave.draft.id;

    const secondSave = DraftService.autosave('usr_1', {
      draftId,
      to: ['client@example.com'],
      subject: 'Proposal draft updated',
      bodyText: 'Second revision draft'
    });

    expect(secondSave.draft.id).toBe(draftId);
    expect(emailStore.messages.length).toBe(1);
    expect(secondSave.draft.bodyText).toBe('Second revision draft');
  });

  it('should discard draft and cleanup empty thread', () => {
    const { draft, thread } = DraftService.autosave('usr_1', {
      subject: 'To be discarded',
      bodyText: 'Delete me'
    });

    expect(emailStore.threads.length).toBe(1);
    expect(emailStore.messages.length).toBe(1);

    const discarded = DraftService.discardDraft('usr_1', draft.id);
    expect(discarded).toBe(true);
    expect(emailStore.messages.length).toBe(0);
    expect(emailStore.threads.length).toBe(0);
  });
});
