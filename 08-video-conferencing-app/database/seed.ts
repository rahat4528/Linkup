import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Linkup Video Conferencing Database...');

  // Clean old records
  await prisma.meetingRecording.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Users
  const hostUser = await prisma.user.create({
    data: {
      email: 'host@linkup-meet.local',
      username: 'sarah_host',
      displayName: 'Sarah Connor',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&fit=crop'
    }
  });

  const attendee1 = await prisma.user.create({
    data: {
      email: 'john@linkup-meet.local',
      username: 'john_tech',
      displayName: 'John Reese',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&fit=crop'
    }
  });

  // 2. Create Active Room
  const activeRoom = await prisma.room.create({
    data: {
      roomCode: 'eng-sync-2026',
      title: 'Weekly Core Engineering Sync',
      description: 'Review architecture milestones, deployment pipelines, and sprint goals.',
      hostId: hostUser.id,
      isLocked: false,
      waitingRoomEnabled: true,
      maxParticipants: 50,
      startedAt: new Date()
    }
  });

  // 3. Add Participants
  await prisma.participant.create({
    data: {
      roomId: activeRoom.id,
      userId: hostUser.id,
      peerId: 'peer-host-01',
      displayName: 'Sarah Connor (Host)',
      role: 'HOST',
      status: 'ADMITTED',
      isMuted: false,
      isVideoOff: false,
      isHandRaised: false,
      isScreenSharing: false
    }
  });

  await prisma.participant.create({
    data: {
      roomId: activeRoom.id,
      userId: attendee1.id,
      peerId: 'peer-attendee-02',
      displayName: 'John Reese',
      role: 'PARTICIPANT',
      status: 'ADMITTED',
      isMuted: true,
      isVideoOff: false,
      isHandRaised: true,
      isScreenSharing: false
    }
  });

  // 4. Add Initial Chat Messages
  await prisma.chatMessage.create({
    data: {
      roomId: activeRoom.id,
      senderId: hostUser.id,
      senderName: 'Sarah Connor',
      content: 'Welcome team! Starting screenshare on the sprint board in 2 minutes.'
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
