import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { MeetingService } from '../services/meeting.service';
import { RoomManager } from '../../../realtime/room-manager';

export const roomManager = new RoomManager();
const meetingService = new MeetingService();

// Pre-create sample engineering sync room
roomManager.createRoom('eng-sync-2026', 'Weekly Core Engineering Sync', 'peer-host-01', 'Sarah Connor (Host)', true);

export class RoomController {
  public async createRoom(req: AuthenticatedRequest, res: Response) {
    try {
      const { title, waitingRoomEnabled, customCode } = req.body;
      const hostDisplayName = req.user?.username || 'Meeting Host';
      const hostPeerId = `peer-host-${Date.now()}`;
      const roomCode = customCode || meetingService.generateRoomCode();

      const room = roomManager.createRoom(
        roomCode,
        title || 'Untitled Meeting',
        hostPeerId,
        hostDisplayName,
        waitingRoomEnabled ?? false
      );

      const joinToken = meetingService.generateJoinToken(roomCode, hostPeerId, 'HOST', hostDisplayName);

      return res.status(201).json({
        roomCode: room.roomCode,
        title: room.title,
        hostPeerId,
        waitingRoomEnabled: room.waitingRoomEnabled,
        joinToken
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to create room', details: err.message });
    }
  }

  public async getRoom(req: Request, res: Response) {
    const { roomCode } = req.params;
    const room = roomManager.getRoom(roomCode as string);

    if (!room) {
      return res.status(404).json({ error: 'Meeting room not found' });
    }

    return res.status(200).json({
      roomCode: room.roomCode,
      title: room.title,
      isLocked: room.isLocked,
      waitingRoomEnabled: room.waitingRoomEnabled,
      participantCount: room.participants.size,
      waitingCount: room.waitingQueue.size,
      createdAt: room.createdAt
    });
  }

  public async joinRoomToken(req: Request, res: Response) {
    const { roomCode } = req.params;
    const { displayName } = req.body;

    const room = roomManager.getRoom(roomCode as string);
    if (!room) {
      return res.status(404).json({ error: 'Meeting room not found' });
    }

    if (room.isLocked) {
      return res.status(403).json({ error: 'Meeting room is locked by host' });
    }

    const peerId = `peer-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const joinToken = meetingService.generateJoinToken(
      roomCode as string,
      peerId,
      'PARTICIPANT',
      displayName || 'Guest Attendee'
    );

    return res.status(200).json({
      roomCode,
      peerId,
      displayName: displayName || 'Guest Attendee',
      waitingRoomRequired: room.waitingRoomEnabled,
      joinToken
    });
  }

  public async testDeviceAudio(req: Request, res: Response) {
    const { samples } = req.body;
    const result = meetingService.evaluateAudioLevel(samples || []);
    return res.status(200).json(result);
  }
}
