export type SignalingMessageType =
  | 'join-room'
  | 'room-joined'
  | 'peer-joined'
  | 'peer-left'
  | 'offer'
  | 'answer'
  | 'ice-candidate'
  | 'waiting-room-queued'
  | 'waiting-room-admitted'
  | 'waiting-room-rejected'
  | 'host-action'
  | 'participant-update'
  | 'room-locked'
  | 'chat-message'
  | 'error';

export interface SignalingMessage {
  type: SignalingMessageType;
  roomId?: string;
  senderPeerId?: string;
  targetPeerId?: string;
  payload?: any;
  timestamp?: number;
}

export interface PeerInfo {
  peerId: string;
  userId?: string;
  displayName: string;
  role: 'HOST' | 'COHOST' | 'PARTICIPANT';
  status: 'WAITING' | 'ADMITTED' | 'LEFT' | 'EXPELLED';
  isMuted: boolean;
  isVideoOff: boolean;
  isHandRaised: boolean;
  isScreenSharing: boolean;
  joinedAt: number;
}

export interface RoomState {
  roomId: string;
  roomCode: string;
  title: string;
  hostPeerId: string;
  isLocked: boolean;
  waitingRoomEnabled: boolean;
  participants: Map<string, PeerInfo>; // peerId -> PeerInfo
  waitingQueue: Map<string, PeerInfo>;  // peerId -> PeerInfo
  createdAt: number;
}
