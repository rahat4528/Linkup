import { TweetPoll, TweetPollOption, TweetPollVote, twitterStore } from './store.service';

export class PollService {
  /**
   * Creates a new poll attached to a post.
   */
  public static createPoll(
    postId: string,
    options: string[],
    durationMinutes: number = 1440 // default 24 hours
  ): TweetPoll {
    if (options.length < 2 || options.length > 4) {
      throw new Error('A poll must have between 2 and 4 options.');
    }

    const pollId = 'poll_' + Math.random().toString(36).substring(2, 9);
    const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

    const pollOptions: TweetPollOption[] = options.map((text, idx) => ({
      id: `opt_${pollId}_${idx}`,
      pollId,
      index: idx,
      text: text.trim(),
      votesCount: 0
    }));

    const poll: TweetPoll = {
      id: pollId,
      postId,
      expiresAt,
      options: pollOptions
    };

    twitterStore.polls.push(poll);
    return poll;
  }

  /**
   * Casts a vote. Enforces strictly one vote per user per poll.
   */
  public static vote(
    pollId: string,
    userId: string,
    optionIndex: number
  ): { success: boolean; poll: TweetPoll & { totalVotes: number; percentages: number[] } } {
    const poll = twitterStore.polls.find(p => p.id === pollId);
    if (!poll) {
      throw new Error('Poll not found');
    }

    if (new Date() > poll.expiresAt) {
      throw new Error('Poll has expired');
    }

    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      throw new Error('Invalid option index');
    }

    // Check unique vote constraint [pollId, userId]
    const existingVote = twitterStore.pollVotes.find(
      v => v.pollId === pollId && v.userId === userId
    );

    if (existingVote) {
      throw new Error('User has already voted in this poll');
    }

    // Record vote
    const vote: TweetPollVote = {
      id: 'vote_' + Math.random().toString(36).substring(2, 9),
      pollId,
      optionIndex,
      userId,
      createdAt: new Date()
    };
    twitterStore.pollVotes.push(vote);

    // Increment option vote count
    poll.options[optionIndex].votesCount += 1;

    return {
      success: true,
      poll: this.getPollWithStats(pollId)!
    };
  }

  /**
   * Retrieves poll with total votes and calculated percentages.
   */
  public static getPollWithStats(pollId: string): (TweetPoll & { totalVotes: number; percentages: number[] }) | null {
    const poll = twitterStore.polls.find(p => p.id === pollId);
    if (!poll) return null;

    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votesCount, 0);
    const percentages = poll.options.map(opt =>
      totalVotes === 0 ? 0 : Math.round((opt.votesCount / totalVotes) * 100)
    );

    return {
      ...poll,
      totalVotes,
      percentages
    };
  }
}
