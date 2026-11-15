import { TweetPost, twitterStore } from './store.service';

export interface ThreadNode {
  post: TweetPost;
  replies: ThreadNode[];
}

export class ThreadService {
  /**
   * Builds a hierarchical tree from all posts belonging to a conversationId.
   */
  public static buildConversationTree(conversationId: string): ThreadNode | null {
    const posts = twitterStore.posts
      .filter(p => p.conversationId === conversationId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    if (posts.length === 0) return null;

    // Find the root post (parentId is null or parentId === conversationId or matches root id)
    const rootPost = posts.find(p => p.id === conversationId || !p.parentId);
    if (!rootPost) return null;

    const nodeMap = new Map<string, ThreadNode>();
    for (const post of posts) {
      // If deleted, apply tombstone text
      const renderedPost: TweetPost = post.isDeleted
        ? { ...post, text: '[This post has been deleted]' }
        : { ...post };

      nodeMap.set(post.id, {
        post: renderedPost,
        replies: []
      });
    }

    // Connect child nodes to their respective parents
    let treeRoot: ThreadNode | null = null;
    for (const post of posts) {
      const currentNode = nodeMap.get(post.id)!;
      if (post.id === rootPost.id) {
        treeRoot = currentNode;
      } else if (post.parentId && nodeMap.has(post.parentId)) {
        nodeMap.get(post.parentId)!.replies.push(currentNode);
      } else if (treeRoot) {
        // Fallback: attach directly to root if parent not found
        treeRoot.replies.push(currentNode);
      }
    }

    return treeRoot;
  }

  /**
   * Returns a flattened ordered list of posts in a conversation (depth-first or chronological).
   */
  public static getOrderedThread(conversationId: string): TweetPost[] {
    const tree = this.buildConversationTree(conversationId);
    if (!tree) return [];

    const result: TweetPost[] = [];
    const traverse = (node: ThreadNode) => {
      result.push(node.post);
      for (const reply of node.replies) {
        traverse(reply);
      }
    };

    traverse(tree);
    return result;
  }
}
