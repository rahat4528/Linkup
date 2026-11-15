import { chatStore, ChatReceipt, ReceiptStatus } from './store.service';

export class ReceiptService {
  private static readonly STATUS_ORDER: Record<ReceiptStatus, number> = {
    SENT: 1,
    DELIVERED: 2,
    READ: 3
  };

  /**
   * Initializes receipt as SENT for all recipients in a conversation.
   */
  public static initReceipt(messageId: string, recipientUserId: string): ChatReceipt {
    const existing = chatStore.receipts.find(
      r => r.messageId === messageId && r.userId === recipientUserId
    );
    if (existing) return existing;

    const receipt: ChatReceipt = {
      id: 'rec_' + Math.random().toString(36).substring(2, 9),
      messageId,
      userId: recipientUserId,
      status: 'SENT',
      updatedAt: new Date()
    };
    chatStore.receipts.push(receipt);
    return receipt;
  }

  /**
   * Transitions receipt status. Guaranteed monotonic (cannot regress).
   */
  public static updateStatus(
    messageId: string,
    recipientUserId: string,
    nextStatus: ReceiptStatus
  ): ChatReceipt {
    let receipt = chatStore.receipts.find(
      r => r.messageId === messageId && r.userId === recipientUserId
    );

    if (!receipt) {
      receipt = this.initReceipt(messageId, recipientUserId);
    }

    const currentRank = this.STATUS_ORDER[receipt.status];
    const nextRank = this.STATUS_ORDER[nextStatus];

    // Only allow forward progression
    if (nextRank > currentRank) {
      receipt.status = nextStatus;
      receipt.updatedAt = new Date();

      if (nextStatus === 'READ') {
        const msg = chatStore.messages.find(m => m.id === messageId);
        if (msg) {
          const member = chatStore.members.find(
            m => m.conversationId === msg.conversationId && m.userId === recipientUserId
          );
          if (member) {
            member.lastReadAt = new Date();
          }
        }
      }
    }

    return receipt;
  }

  /**
   * Gets aggregate receipt summary for a message.
   * If all recipients have READ, returns READ.
   * If all have at least DELIVERED, returns DELIVERED.
   * Otherwise SENT.
   */
  public static getMessageStatus(messageId: string): ReceiptStatus {
    const receipts = chatStore.receipts.filter(r => r.messageId === messageId);
    if (receipts.length === 0) return 'SENT';

    const allRead = receipts.every(r => r.status === 'READ');
    if (allRead) return 'READ';

    const allDeliveredOrRead = receipts.every(r => r.status === 'DELIVERED' || r.status === 'READ');
    if (allDeliveredOrRead) return 'DELIVERED';

    return 'SENT';
  }
}
