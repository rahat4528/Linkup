import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Linkup Podcast Platform Database...');

  // Clean old records
  await prisma.listeningHistory.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.episode.deleteMany();
  await prisma.podcast.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Creator User
  const creator = await prisma.user.create({
    data: {
      email: 'creator@linkup-podcast.local',
      username: 'tech_voices',
      displayName: 'Elena Rostova',
      passwordHash,
      role: 'CREATOR',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&fit=crop'
    }
  });

  const listener = await prisma.user.create({
    data: {
      email: 'listener@linkup-podcast.local',
      username: 'audio_nerd',
      displayName: 'Sam Porter',
      passwordHash,
      role: 'USER',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&fit=crop'
    }
  });

  // 2. Create Podcast Show
  const podcast = await prisma.podcast.create({
    data: {
      title: 'Architectures of Tomorrow',
      slug: 'architectures-of-tomorrow',
      description: 'Deep dives into distributed systems, real-time protocols, and engineering scale.',
      author: 'Elena Rostova',
      coverUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&fit=crop',
      category: 'Technology',
      language: 'en',
      explicit: false,
      websiteUrl: 'https://linkup.local/podcasts/architectures-of-tomorrow',
      creatorId: creator.id
    }
  });

  // 3. Create Episodes with Chapters
  const ep1 = await prisma.episode.create({
    data: {
      podcastId: podcast.id,
      title: 'Episode 1: The Evolution of WebRTC & Realtime Media',
      description: 'Understanding SFU vs MCU architectures, ICE candidate negotiation, and browser codecs.',
      episodeNumber: 1,
      seasonNumber: 1,
      audioUrl: 'https://cdn.linkup.local/media/aot-ep1.mp3',
      durationSeconds: 2740.0, // 45m 40s
      fileSize: 65760000,
      mimeType: 'audio/mpeg',
      status: 'PUBLISHED',
      explicit: false,
      playCount: 4200,
      publishedAt: new Date(Date.now() - 7 * 86400000)
    }
  });

  await prisma.chapter.createMany({
    data: [
      { episodeId: ep1.id, title: 'Introduction & State of Realtime', startTimeSeconds: 0, endTimeSeconds: 320 },
      { episodeId: ep1.id, title: 'Signaling and ICE Trickle Mechanics', startTimeSeconds: 320, endTimeSeconds: 1140 },
      { episodeId: ep1.id, title: 'Selective Forwarding Units (SFU) Deep Dive', startTimeSeconds: 1140, endTimeSeconds: 2100 },
      { episodeId: ep1.id, title: 'Future of WebTransport and Media Over QUIC', startTimeSeconds: 2100, endTimeSeconds: 2740 }
    ]
  });

  const ep2 = await prisma.episode.create({
    data: {
      podcastId: podcast.id,
      title: 'Episode 2: Scaling Event-Driven Systems with Kafka and BullMQ',
      description: 'Practical patterns for transactional outbox, deduplication, and backpressure handling.',
      episodeNumber: 2,
      seasonNumber: 1,
      audioUrl: 'https://cdn.linkup.local/media/aot-ep2.mp3',
      durationSeconds: 3120.0,
      fileSize: 74880000,
      mimeType: 'audio/mpeg',
      status: 'PUBLISHED',
      explicit: false,
      playCount: 3150,
      publishedAt: new Date(Date.now() - 2 * 86400000)
    }
  });

  // 4. Create Subscription
  await prisma.subscription.create({
    data: {
      userId: listener.id,
      podcastId: podcast.id
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
