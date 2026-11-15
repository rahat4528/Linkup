import { ThreadService } from '../../src/services/thread.service';
import { twitterStore, TweetPost } from '../../src/services/store.service';

describe('ThreadService', () => {
  beforeEach(() => {
    twitterStore.clear();
  });

  it('should build hierarchical tree from conversation posts', () => {
    const rootPost: TweetPost = {
      id: 'post_1',
      authorId: 'usr_1',
      text: 'Root post',
      conversationId: 'post_1',
      parentId: null,
      isDeleted: false,
      isEdited: false,
      createdAt: new Date('2026-01-01T10:00:00Z'),
      updatedAt: new Date('2026-01-01T10:00:00Z')
    };

    const reply1: TweetPost = {
      id: 'post_2',
      authorId: 'usr_2',
      text: 'First reply to root',
      conversationId: 'post_1',
      parentId: 'post_1',
      isDeleted: false,
      isEdited: false,
      createdAt: new Date('2026-01-01T10:05:00Z'),
      updatedAt: new Date('2026-01-01T10:05:00Z')
    };

    const reply2: TweetPost = {
      id: 'post_3',
      authorId: 'usr_3',
      text: 'Nested reply to first reply',
      conversationId: 'post_1',
      parentId: 'post_2',
      isDeleted: false,
      isEdited: false,
      createdAt: new Date('2026-01-01T10:10:00Z'),
      updatedAt: new Date('2026-01-01T10:10:00Z')
    };

    twitterStore.posts.push(rootPost, reply1, reply2);

    const tree = ThreadService.buildConversationTree('post_1');
    expect(tree).not.toBeNull();
    expect(tree!.post.id).toBe('post_1');
    expect(tree!.replies.length).toBe(1);
    expect(tree!.replies[0].post.id).toBe('post_2');
    expect(tree!.replies[0].replies.length).toBe(1);
    expect(tree!.replies[0].replies[0].post.id).toBe('post_3');
  });

  it('should apply tombstone text to deleted posts while preserving child replies', () => {
    const rootPost: TweetPost = {
      id: 'post_1',
      authorId: 'usr_1',
      text: 'Root post content',
      conversationId: 'post_1',
      parentId: null,
      isDeleted: true, // Deleted
      isEdited: false,
      createdAt: new Date('2026-01-01T10:00:00Z'),
      updatedAt: new Date('2026-01-01T10:15:00Z')
    };

    const reply: TweetPost = {
      id: 'post_2',
      authorId: 'usr_2',
      text: 'Reply still standing',
      conversationId: 'post_1',
      parentId: 'post_1',
      isDeleted: false,
      isEdited: false,
      createdAt: new Date('2026-01-01T10:05:00Z'),
      updatedAt: new Date('2026-01-01T10:05:00Z')
    };

    twitterStore.posts.push(rootPost, reply);

    const tree = ThreadService.buildConversationTree('post_1');
    expect(tree).not.toBeNull();
    expect(tree!.post.isDeleted).toBe(true);
    expect(tree!.post.text).toBe('[This post has been deleted]');
    expect(tree!.replies.length).toBe(1);
    expect(tree!.replies[0].post.text).toBe('Reply still standing');
  });
});
