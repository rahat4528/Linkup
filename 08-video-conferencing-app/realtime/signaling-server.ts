import { Server as HttpServer } from 'http';
const WebSocket = require('ws');
import { RoomManager } from './room-manager';
import { SignalingMessage } from './signaling-protocol';

export class SignalingServer {
  private wss: any;
  private roomManager: RoomManager;
  private peerSockets: Map<string, any> = new Map(); // peerId -> WebSocket
  private socketPeers: Map<any, { peerId: string; roomCode: string }> = new Map();

  constructor(server: HttpServer, roomManager: RoomManager) {
    this.roomManager = roomManager;
    this.wss = new WebSocket.Server({ server, path: '/signaling' });
    this.init();
  }

  private init() {
    this.wss.on('connection', (ws: any) => {
      ws.on('message', (data: string) => {
        try {
          const message: SignalingMessage = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (e: any) {
          this.send(ws, { type: 'error', payload: { message: 'Invalid JSON payload' } });
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(ws);
      });
    });
  }

  private handleMessage(ws: any, message: SignalingMessage) {
    switch (message.type) {
      case 'join-room': {
        const { roomCode, peerId, displayName, isHost } = message.payload;
        this.peerSockets.set(peerId, ws);
        this.socketPeers.set(ws, { peerId, roomCode });

        const result = this.roomManager.joinRoom(roomCode, peerId, displayName, isHost);

        if (result.status === 'REJECTED') {
          return this.send(ws, { type: 'error', payload: { error: result.error } });
        }

        if (result.status === 'WAITING') {
          this.send(ws, {
            type: 'waiting-room-queued',
            roomId: result.room?.roomId,
            senderPeerId: peerId
          });
          // Notify host of queued participant
          const hostWs = this.peerSockets.get(result.room!.hostPeerId);
          if (hostWs) {
            this.send(hostWs, {
              type: 'participant-update',
              payload: { action: 'QUEUED', peerId, displayName }
            });
          }
          return;
        }

        // Admitted to room
        const room = result.room!;
        const participantsList = Array.from(room.participants.values());

        this.send(ws, {
          type: 'room-joined',
          roomId: room.roomId,
          payload: {
            roomCode,
            title: room.title,
            hostPeerId: room.hostPeerId,
            participants: participantsList
          }
        });

        // Broadcast peer-joined to all other participants
        this.broadcastToRoom(roomCode, peerId, {
          type: 'peer-joined',
          roomId: room.roomId,
          senderPeerId: peerId,
          payload: { peer: room.participants.get(peerId) }
        });
        break;
      }

      case 'offer':
      case 'answer':
      case 'ice-candidate': {
        // Forward SDP or ICE candidate directly to target peer
        if (message.targetPeerId) {
          const targetWs = this.peerSockets.get(message.targetPeerId);
          if (targetWs) {
            this.send(targetWs, message);
          }
        }
        break;
      }

      case 'host-action': {
        const { roomCode, action, targetPeerId, hostPeerId } = message.payload;
        if (action === 'ADMIT') {
          const admitted = this.roomManager.admitParticipant(roomCode, targetPeerId, hostPeerId);
          if (admitted) {
            const targetWs = this.peerSockets.get(targetPeerId);
            if (targetWs) {
              const room = this.roomManager.getRoom(roomCode);
              this.send(targetWs, {
                type: 'waiting-room-admitted',
                payload: { roomCode, participants: Array.from(room?.participants.values() || []) }
              });
            }
            this.broadcastToRoom(roomCode, hostPeerId, {
              type: 'peer-joined',
              payload: { peerId: targetPeerId }
            });
          }
        } else if (action === 'EXPEL') {
          const expelled = this.roomManager.expelParticipant(roomCode, targetPeerId, hostPeerId);
          if (expelled) {
            const targetWs = this.peerSockets.get(targetPeerId);
            if (targetWs) {
              this.send(targetWs, { type: 'host-action', payload: { action: 'EXPELLED' } });
            }
            this.broadcastToRoom(roomCode, hostPeerId, {
              type: 'peer-left',
              payload: { peerId: targetPeerId, reason: 'EXPELLED' }
            });
          }
        } else if (action === 'MUTE') {
          this.roomManager.remoteMute(roomCode, targetPeerId, hostPeerId);
          const targetWs = this.peerSockets.get(targetPeerId);
          if (targetWs) {
            this.send(targetWs, { type: 'host-action', payload: { action: 'MUTED_BY_HOST' } });
          }
          this.broadcastToRoom(roomCode, hostPeerId, {
            type: 'participant-update',
            payload: { peerId: targetPeerId, isMuted: true }
          });
        }
        break;
      }

      case 'chat-message': {
        const { roomCode } = message.payload;
        this.broadcastToRoom(roomCode, message.senderPeerId, message);
        break;
      }

      default:
        break;
    }
  }

  private handleDisconnect(ws: any) {
    const info = this.socketPeers.get(ws);
    if (!info) return;

    const { peerId, roomCode } = info;
    this.peerSockets.delete(peerId);
    this.socketPeers.delete(ws);

    const { left, newHostId } = this.roomManager.leaveRoom(roomCode, peerId);
    if (left) {
      this.broadcastToRoom(roomCode, peerId, {
        type: 'peer-left',
        senderPeerId: peerId,
        payload: { peerId, newHostId }
      });
    }
  }

  private broadcastToRoom(roomCode: string, excludePeerId: string | undefined, message: SignalingMessage) {
    const room = this.roomManager.getRoom(roomCode);
    if (!room) return;

    for (const [peerId] of room.participants) {
      if (peerId !== excludePeerId) {
        const ws = this.peerSockets.get(peerId);
        if (ws) {
          this.send(ws, message);
        }
      }
    }
  }

  private send(ws: any, message: SignalingMessage) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  public close() {
    this.wss.close();
  }
}
