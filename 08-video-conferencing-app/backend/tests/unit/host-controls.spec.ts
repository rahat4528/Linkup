import { RoomManager } from '../../../realtime/room-manager';

describe('RoomManager - Host Controls & Moderation Permissions', () => {
  let manager: RoomManager;

  beforeEach(() => {
    manager = new RoomManager();
    manager.createRoom('moderated-room', 'Board Review', 'host-1', 'Host Alice', true);
  });

  it('should allow host to admit participant from waiting room', () => {
    manager.joinRoom('moderated-room', 'peer-bob', 'Bob');
    const room = manager.getRoom('moderated-room');
    expect(room?.waitingQueue.size).toBe(1);

    const admitted = manager.admitParticipant('moderated-room', 'peer-bob', 'host-1');
    expect(admitted).toBe(true);
    expect(room?.waitingQueue.size).toBe(0);
    expect(room?.participants.get('peer-bob')?.status).toBe('ADMITTED');
  });

  it('should reject admission attempt by non-host', () => {
    manager.joinRoom('moderated-room', 'peer-bob', 'Bob');
    const admitted = manager.admitParticipant('moderated-room', 'peer-bob', 'fake-host');
    expect(admitted).toBe(false);

    const room = manager.getRoom('moderated-room');
    expect(room?.waitingQueue.size).toBe(1);
  });

  it('should allow host to remotely mute a participant', () => {
    // Disable waiting room to admit directly
    const directRoom = manager.createRoom('direct-room', 'Sync', 'host-1', 'Alice', false);
    manager.joinRoom('direct-room', 'peer-loud', 'Loud User');

    const muted = manager.remoteMute('direct-room', 'peer-loud', 'host-1');
    expect(muted).toBe(true);

    const peer = directRoom.participants.get('peer-loud');
    expect(peer?.isMuted).toBe(true);
  });

  it('should prevent non-host from remotely muting other participants', () => {
    const directRoom = manager.createRoom('direct-room-2', 'Sync', 'host-1', 'Alice', false);
    manager.joinRoom('direct-room-2', 'peer-loud', 'Loud User');

    const muted = manager.remoteMute('direct-room-2', 'peer-loud', 'unauthorized-user');
    expect(muted).toBe(false);
  });

  it('should allow host to expel a participant', () => {
    const directRoom = manager.createRoom('expel-room', 'Sync', 'host-1', 'Alice', false);
    manager.joinRoom('expel-room', 'peer-troll', 'Troll');
    expect(directRoom.participants.size).toBe(2);

    const expelled = manager.expelParticipant('expel-room', 'peer-troll', 'host-1');
    expect(expelled).toBe(true);
    expect(directRoom.participants.has('peer-troll')).toBe(false);
  });

  it('should prevent host from expelling themselves', () => {
    const directRoom = manager.createRoom('self-expel', 'Sync', 'host-1', 'Alice', false);
    const expelled = manager.expelParticipant('self-expel', 'host-1', 'host-1');
    expect(expelled).toBe(false);
    expect(directRoom.participants.has('host-1')).toBe(true);
  });
});
