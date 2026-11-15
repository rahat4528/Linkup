import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { PollService } from '../services/poll.service';

export class PollController {
  public static async vote(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const pollId = req.params.pollId as string;
      const userId = req.user!.id;
      const { optionIndex } = req.body;

      if (optionIndex === undefined || typeof optionIndex !== 'number') {
        res.status(400).json({ error: 'optionIndex is required and must be a number' });
        return;
      }

      const result = PollService.vote(pollId, userId, optionIndex);
      res.status(200).json(result);
    } catch (err: any) {
      if (err.message === 'User has already voted in this poll') {
        res.status(409).json({ error: err.message });
      } else if (err.message === 'Poll not found') {
        res.status(404).json({ error: err.message });
      } else {
        res.status(400).json({ error: err.message || 'Error processing vote' });
      }
    }
  }
}
