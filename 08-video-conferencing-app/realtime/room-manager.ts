import { PeerInfo, RoomState, SignalingMessage } from './signaling-protocol';

export class RoomManager {
  private rooms: Map<string, RoomState> = new Map(); // roomCode -> RoomState

  public createRoom(
    roomCode: string,
    title: string,
    hostPeerId: string,
    hostDisplayName: string,
    waitingRoomEnabled: boolean = false
  ): RoomState {
    const hostPeer: PeerInfo = {
      peerId: hostPeerId,
      displayName: hostDisplayName,
      role: 'HOST',
      status: 'ADMITTED',
      isMuted: false,
      isVideoOff: false,
      isHandRaised: false,
      isScreenSharing: false,
      joinedAt: Date.now()
    };

    const participants = new Map<string, PeerInfo>();
    participants.set(hostPeerId, hostPeer);

    const room: RoomState = {
      roomId: `room-${Date.now()}`,
      roomCode,
      title,
      hostPeerId,
      isLocked: false,
      waitingRoomEnabled,
      participants,
      waitingQueue: new Map<string, PeerInfo>(),
      createdAt: Date.now()
    };

    this.rooms.set(roomCode, room);
    return room;
  }

  public getRoom(roomCode: string): RoomState | undefined {
    return this.rooms.get(roomCode);
  }

  public joinRoom(
    roomCode: string,
    peerId: string,
    displayName: string,
    isHost: boolean = false
  ): { status: 'ADMITTED' | 'WAITING' | 'REJECTED'; room?: RoomState; error?: string } {
    const room = this.rooms.get(roomCode);
    if (!room) {
      return { status: 'REJECTED', error: 'Room does not exist' };
    }

    if (room.isLocked) {
      return { status: 'REJECTED', error: 'Room is locked by host' };
    }

    const peer: PeerInfo = {
      peerId,
      displayName,
      role: isHost || room.hostPeerId === peerId ? 'HOST' : 'PARTICIPANT',
      status: isHost || !room.waitingRoomEnabled ? 'ADMITTED' : 'WAITING',
      isMuted: false,
      isVideoOff: false,
      isHandRaised: false,
      isScreenSharing: false,
      joinedAt: Date.now()
    };

    if (peer.status === 'WAITING') {
      room.waitingQueue.set(peerId, peer);
      return { status: 'WAITING', room };
    }

    room.participants.set(peerId, peer);
    return { status: 'ADMITTED', room };
  }

  public leaveRoom(roomCode: string, peerId: string): { left: boolean; newHostId?: string } {
    const room = this.rooms.get(roomCode);
    if (!room) return { left: false };

    room.waitingQueue.delete(peerId);
    const wasInRoom = room.participants.delete(peerId);

    // If host left, elect next participant as host or remove room if empty
    let newHostId: string | undefined;
    if (room.hostPeerId === peerId) {
      const nextParticipant = room.participants.values().next().value;
      if (nextParticipant) {
        nextParticipant.role = 'HOST';
        room.hostPeerId = nextParticipant.peerId;
        newHostId = nextParticipant.peerId;
      } else {
        // Room is empty
        this.rooms.delete(roomCode);
      }
    }

    return { left: wasInRoom, newHostId };
  }

  public admitParticipant(roomCode: string, peerId: string, hostPeerId: string): boolean {
    const room = this.rooms.get(roomCode);
    if (!room || room.hostPeerId !== hostPeerId) return false;

    const peer = room.waitingQueue.get(peerId);
    if (!peer) return false;

    peer.status = 'ADMITTED';
    room.waitingQueue.delete(peerId);
    room.participants.set(peerId, peer);
    return true;
  }

  public rejectParticipant(roomCode: string, peerId: string, hostPeerId: string): boolean {
    const room = this.rooms.get(roomCode);
    if (!room || room.hostPeerId !== hostPeerId) return false;

    return room.waitingQueue.delete(peerId);
  }

  public expelParticipant(roomCode: string, targetPeerId: string, hostPeerId: string): boolean {
    const room = this.rooms.get(roomCode);
    if (!room || room.hostPeerId !== hostPeerId) return false;
    if (targetPeerId === hostPeerId) return false; // Host cannot expel themselves

    const peer = room.participants.get(targetPeerId);
    if (!peer) return false;

    peer.status = 'EXPELLED';
    room.participants.delete(targetPeerId);
    return true;
  }

  public remoteMute(roomCode: string, targetPeerId: string, hostPeerId: string): boolean {
    const room = this.rooms.get(roomCode);
    if (!room || room.hostPeerId !== hostPeerId) return false;

    const peer = room.participants.get(targetPeerId);
    if (!peer) return false;

    peer.isMuted = true;
    return true;
  }

  public lockRoom(roomCode: string, isLocked: boolean, hostPeerId: string): boolean {
    const room = this.rooms.get(roomCode);
    if (!room || room.hostPeerId !== hostPeerId) return false;

    room.isLocked = isLocked;
    return true;
  }

  public toggleHandRaise(roomCode: string, peerId: string): boolean {
    const room = this.rooms.get(roomCode);
    if (!room) return false;

    const peer = room.participants.get(peerId);
    if (!peer) return false;

    peer.isHandRaised = !peer.isHandRaised;
    return peer.isHandRaised;
  }

  public updatePeerMedia(
    roomCode: string,
    peerId: string,
    updates: Partial<Pick<PeerInfo, 'isMuted' | 'isVideoOff' | 'isScreenSharing'>>
  ): PeerInfo | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    const peer = room.participants.get(peerId);
    if (!peer) return null;

    if (updates.isMuted !== undefined) peer.isMuted = updates.isMuted;
    if (updates.isVideoOff !== undefined) peer.isVideoOff = updates.isVideoOff;
    if (updates.isScreenSharing !== undefined) peer.isScreenSharing = updates.isScreenSharing;

    return peer;
  }
}
