import { ReceiptService } from '../../src/services/receipt.service';
import { chatStore } from '../../src/services/store.service';

describe('ReceiptService', () => {
  beforeEach(() => {
    chatStore.clear();
  });

  it('should initialize receipt as SENT', () => {
    const receipt = ReceiptService.initReceipt('msg_1', 'user_2');
    expect(receipt.status).toBe('SENT');
  });

  it('should transition monotonically from SENT -> DELIVERED -> READ', () => {
    ReceiptService.initReceipt('msg_1', 'user_2');

    const delivered = ReceiptService.updateStatus('msg_1', 'user_2', 'DELIVERED');
    expect(delivered.status).toBe('DELIVERED');

    const read = ReceiptService.updateStatus('msg_1', 'user_2', 'READ');
    expect(read.status).toBe('READ');

    // Attempt backward regression to DELIVERED
    const regressed = ReceiptService.updateStatus('msg_1', 'user_2', 'DELIVERED');
    expect(regressed.status).toBe('READ'); // Remains READ
  });

  it('should calculate aggregate message status across multiple recipients', () => {
    ReceiptService.initReceipt('msg_group', 'user_2');
    ReceiptService.initReceipt('msg_group', 'user_3');

    // Both are SENT
    expect(ReceiptService.getMessageStatus('msg_group')).toBe('SENT');

    // One delivered, one still SENT
    ReceiptService.updateStatus('msg_group', 'user_2', 'DELIVERED');
    expect(ReceiptService.getMessageStatus('msg_group')).toBe('SENT');

    // Both delivered
    ReceiptService.updateStatus('msg_group', 'user_3', 'DELIVERED');
    expect(ReceiptService.getMessageStatus('msg_group')).toBe('DELIVERED');

    // One read, one delivered
    ReceiptService.updateStatus('msg_group', 'user_2', 'READ');
    expect(ReceiptService.getMessageStatus('msg_group')).toBe('DELIVERED');

    // Both read
    ReceiptService.updateStatus('msg_group', 'user_3', 'READ');
    expect(ReceiptService.getMessageStatus('msg_group')).toBe('READ');
  });
});
