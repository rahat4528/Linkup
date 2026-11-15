import { TweetCommunityNote, TweetNoteRating, twitterStore } from './store.service';

export class NotesService {
  /**
   * Proposes a new community note for a post.
   */
  public static proposeNote(postId: string, authorId: string, text: string): TweetCommunityNote {
    const note: TweetCommunityNote = {
      id: 'note_' + Math.random().toString(36).substring(2, 9),
      postId,
      authorId,
      text: text.trim(),
      status: 'NEEDS_MORE_RATINGS',
      createdAt: new Date()
    };

    twitterStore.communityNotes.push(note);
    return note;
  }

  /**
   * Adds or updates a rating for a community note.
   * userBias is a score between -1 and 1 reflecting user perspective diversity.
   */
  public static rateNote(
    noteId: string,
    userId: string,
    isHelpful: boolean,
    userBias: number = 0
  ): TweetCommunityNote {
    const note = twitterStore.communityNotes.find(n => n.id === noteId);
    if (!note) {
      throw new Error('Note not found');
    }

    // Check if user already rated; update if so, else add
    const existingIndex = twitterStore.noteRatings.findIndex(
      r => r.noteId === noteId && r.userId === userId
    );

    if (existingIndex >= 0) {
      twitterStore.noteRatings[existingIndex].isHelpful = isHelpful;
      twitterStore.noteRatings[existingIndex].userBias = userBias;
    } else {
      const rating: TweetNoteRating = {
        id: 'rating_' + Math.random().toString(36).substring(2, 9),
        noteId,
        userId,
        isHelpful,
        userBias,
        createdAt: new Date()
      };
      twitterStore.noteRatings.push(rating);
    }

    // Recalculate status based on diversity matrix
    this.recalculateStatus(note);
    return note;
  }

  /**
   * Evaluates consensus across diverse viewpoints.
   */
  private static recalculateStatus(note: TweetCommunityNote): void {
    const ratings = twitterStore.noteRatings.filter(r => r.noteId === note.id);
    if (ratings.length < 3) {
      note.status = 'NEEDS_MORE_RATINGS';
      return;
    }

    // Calculate bias variance
    const biases = ratings.map(r => r.userBias);
    const meanBias = biases.reduce((a, b) => a + b, 0) / biases.length;
    const variance = biases.reduce((sum, b) => sum + Math.pow(b - meanBias, 2), 0) / biases.length;

    const helpfulCount = ratings.filter(r => r.isHelpful).length;
    const helpfulRatio = helpfulCount / ratings.length;

    // A note is marked HELPFUL only if it achieves consensus across diverse viewpoints (variance >= 0.25)
    if (variance >= 0.25) {
      if (helpfulRatio >= 0.67) {
        note.status = 'HELPFUL';
      } else if (helpfulRatio <= 0.33) {
        note.status = 'NOT_HELPFUL';
      } else {
        note.status = 'NEEDS_MORE_RATINGS';
      }
    } else {
      // Not enough diversity in ratings yet
      note.status = 'NEEDS_MORE_RATINGS';
    }
  }

  /**
   * Gets all helpful notes for a post to display beneath it.
   */
  public static getHelpfulNotesForPost(postId: string): TweetCommunityNote[] {
    return twitterStore.communityNotes.filter(
      n => n.postId === postId && n.status === 'HELPFUL'
    );
  }
}
