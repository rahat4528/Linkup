import { PollService } from '../../src/services/poll.service';
import { twitterStore } from '../../src/services/store.service';

describe('PollService', () => {
  beforeEach(() => {
    twitterStore.clear();
  });

  it('should create poll with 2 to 4 options and reject fewer than 2 or more than 4', () => {
    expect(() => PollService.createPoll('p1', ['Only one'])).toThrow('A poll must have between 2 and 4 options.');
    expect(() => PollService.createPoll('p1', ['1', '2', '3', '4', '5'])).toThrow('A poll must have between 2 and 4 options.');

    const poll = PollService.createPoll('p1', ['Option A', 'Option B', 'Option C']);
    expect(poll.options.length).toBe(3);
    expect(poll.options[0].text).toBe('Option A');
    expect(poll.options[1].votesCount).toBe(0);
  });

  it('should allow a user to vote and calculate accurate percentages', () => {
    const poll = PollService.createPoll('p1', ['TypeScript', 'JavaScript']);

    const vote1 = PollService.vote(poll.id, 'user_1', 0);
    expect(vote1.poll.totalVotes).toBe(1);
    expect(vote1.poll.percentages).toEqual([100, 0]);

    const vote2 = PollService.vote(poll.id, 'user_2', 1);
    expect(vote2.poll.totalVotes).toBe(2);
    expect(vote2.poll.percentages).toEqual([50, 50]);
  });

  it('should strictly enforce one vote per user per poll', () => {
    const poll = PollService.createPoll('p1', ['Yes', 'No']);

    PollService.vote(poll.id, 'user_1', 0);

    expect(() => PollService.vote(poll.id, 'user_1', 1)).toThrow('User has already voted in this poll');
  });
});
