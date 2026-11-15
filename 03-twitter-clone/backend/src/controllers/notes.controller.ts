import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { NotesService } from '../services/notes.service';
import { twitterStore } from '../services/store.service';

export class NotesController {
  public static async proposeNote(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const postId = req.params.postId as string;
      const authorId = req.user!.id;
      const { text } = req.body;

      if (!text || typeof text !== 'string') {
        res.status(400).json({ error: 'Note text is required' });
        return;
      }

      const post = twitterStore.posts.find(p => p.id === postId);
      if (!post || post.isDeleted) {
        res.status(404).json({ error: 'Post not found or deleted' });
        return;
      }

      const note = NotesService.proposeNote(postId, authorId, text);
      res.status(201).json({
        message: 'Community note proposed',
        note
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }

  public static async rateNote(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const noteId = req.params.noteId as string;
      const userId = req.user!.id;
      const { isHelpful, userBias } = req.body;

      if (typeof isHelpful !== 'boolean') {
        res.status(400).json({ error: 'isHelpful must be a boolean' });
        return;
      }

      const bias = typeof userBias === 'number' ? userBias : 0;
      const updatedNote = NotesService.rateNote(noteId, userId, isHelpful, bias);

      res.status(200).json({
        message: 'Note rated successfully',
        note: updatedNote
      });
    } catch (err: any) {
      if (err.message === 'Note not found') {
        res.status(404).json({ error: err.message });
      } else {
        res.status(500).json({ error: err.message || 'Internal server error' });
      }
    }
  }

  public static async getNotesForPost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const postId = req.params.postId as string;
      const notes = twitterStore.communityNotes.filter(n => n.postId === postId);
      res.status(200).json({
        postId,
        notes
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
}
