import { NotesService } from '../../src/services/notes.service';
import { twitterStore } from '../../src/services/store.service';

describe('NotesService', () => {
  beforeEach(() => {
    twitterStore.clear();
  });

  it('should initialize proposed note with NEEDS_MORE_RATINGS status', () => {
    const note = NotesService.proposeNote('p1', 'usr_author', 'Context: this was taken in 2019, not 2026.');
    expect(note.status).toBe('NEEDS_MORE_RATINGS');
    expect(note.text).toContain('Context: this was taken');
  });

  it('should not mark note HELPFUL if ratings lack viewpoint diversity', () => {
    const note = NotesService.proposeNote('p1', 'usr_author', 'Explanation note');

    // 3 users all rating helpful, but all with identical bias (0.8) -> variance is 0
    NotesService.rateNote(note.id, 'u1', true, 0.8);
    NotesService.rateNote(note.id, 'u2', true, 0.8);
    const updated = NotesService.rateNote(note.id, 'u3', true, 0.8);

    expect(updated.status).toBe('NEEDS_MORE_RATINGS');
  });

  it('should mark note HELPFUL when consensus is reached across diverse raters (variance >= 0.25)', () => {
    const note = NotesService.proposeNote('p1', 'usr_author', 'Cross-party consensus context');

    // Diverse raters with opposing biases: -0.9, 0.0, +0.9
    // Mean = 0, Variance = (0.81 + 0 + 0.81) / 3 = 0.54 >= 0.25
    NotesService.rateNote(note.id, 'u1', true, -0.9);
    NotesService.rateNote(note.id, 'u2', true, 0.0);
    const updated = NotesService.rateNote(note.id, 'u3', true, 0.9);

    expect(updated.status).toBe('HELPFUL');
  });
});
