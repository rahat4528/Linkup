import { RoomManager } from '../../../realtime/room-manager';

describe('RoomManager - Conference Room Lifecycle & State', () => {
  let manager: RoomManager;

  beforeEach(() => {
    manager = new RoomManager();
  });

  it('should create a room with host participant', () => {
    const room = manager.createRoom('test-room-1', 'Daily Standup', 'host-1', 'Host Alice');
    expect(room.roomCode).toBe('test-room-1');
    expect(room.title).toBe('Daily Standup');
    expect(room.hostPeerId).toBe('host-1');
    expect(room.participants.size).toBe(1);

    const host = room.participants.get('host-1');
    expect(host?.role).toBe('HOST');
    expect(host?.status).toBe('ADMITTED');
  });

  it('should allow participants to join directly if waiting room is disabled', () => {
    manager.createRoom('open-room', 'Open Meeting', 'host-1', 'Host Alice', false);
    const result = manager.joinRoom('open-room', 'peer-bob', 'Bob');

    expect(result.status).toBe('ADMITTED');
    expect(result.room?.participants.size).toBe(2);
    expect(result.room?.participants.get('peer-bob')?.status).toBe('ADMITTED');
  });

  it('should place participants into waiting room queue when enabled', () => {
    manager.createRoom('secure-room', 'Secure Meeting', 'host-1', 'Host Alice', true);
    const result = manager.joinRoom('secure-room', 'peer-carol', 'Carol');

    expect(result.status).toBe('WAITING');
    expect(result.room?.waitingQueue.size).toBe(1);
    expect(result.room?.participants.size).toBe(1); // Only host in room
  });

  it('should reject join when room is locked', () => {
    manager.createRoom('locked-room', 'Locked Meeting', 'host-1', 'Host Alice', false);
    manager.lockRoom('locked-room', true, 'host-1');

    const result = manager.joinRoom('locked-room', 'peer-intruder', 'Intruder');
    expect(result.status).toBe('REJECTED');
    expect(result.error).toContain('locked');
  });

  it('should elect new host when current host leaves if other participants exist', () => {
    manager.createRoom('auto-host-room', 'Team Sync', 'host-alice', 'Alice', false);
    manager.joinRoom('auto-host-room', 'peer-bob', 'Bob');

    const leaveResult = manager.leaveRoom('auto-host-room', 'host-alice');
    expect(leaveResult.left).toBe(true);
    expect(leaveResult.newHostId).toBe('peer-bob');

    const room = manager.getRoom('auto-host-room');
    expect(room?.hostPeerId).toBe('peer-bob');
    expect(room?.participants.get('peer-bob')?.role).toBe('HOST');
  });

  it('should toggle hand raise for participant', () => {
    manager.createRoom('qa-room', 'Q&A Session', 'host-1', 'Alice', false);
    manager.joinRoom('qa-room', 'peer-bob', 'Bob');

    const raised = manager.toggleHandRaise('qa-room', 'peer-bob');
    expect(raised).toBe(true);

    const lowered = manager.toggleHandRaise('qa-room', 'peer-bob');
    expect(lowered).toBe(false);
  });
});
