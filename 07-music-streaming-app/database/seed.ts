import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Helper to generate synthetic waveform peaks [0 - 100]
function generateSyntheticWaveform(points: number = 100): number[] {
  const peaks: number[] = [];
  for (let i = 0; i < points; i++) {
    // Combine multiple sine waves with random harmonics for realistic music waveform shape
    const base = Math.sin((i / points) * Math.PI) * 50;
    const harmonic = Math.sin((i / 5) * Math.PI) * 20;
    const noise = Math.random() * 25;
    const value = Math.min(100, Math.max(5, Math.round(base + harmonic + noise)));
    peaks.push(value);
  }
  return peaks;
}

async function main() {
  console.log('Seeding Linkup Music Streaming Database...');

  // 1. Clean existing records
  await prisma.streamSession.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.playlistTrack.deleteMany();
  await prisma.playlist.deleteMany();
  await prisma.track.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 2. Create users
  const artistUser = await prisma.user.create({
    data: {
      email: 'artist@linkup-streaming.local',
      username: 'sonicflow',
      displayName: 'Sonic Flow',
      passwordHash,
      role: 'CREATOR',
      avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&fit=crop'
    }
  });

  const listenerUser = await prisma.user.create({
    data: {
      email: 'listener@linkup-streaming.local',
      username: 'audiophile',
      displayName: 'Alex Audiophile',
      passwordHash,
      role: 'USER',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop'
    }
  });

  // 3. Create sample tracks with realistic waveform data
  const sampleTracks = [
    {
      title: 'Neon Horizon',
      artist: 'Sonic Flow',
      album: 'Cybernetic Echoes',
      genre: 'Synthwave',
      durationSeconds: 214.5,
      fileSize: 5148000,
      mimeType: 'audio/mpeg',
      filePath: 'media/neon-horizon.mp3',
      waveformData: generateSyntheticWaveform(120),
      uploaderId: artistUser.id
    },
    {
      title: 'Midnight Reverie',
      artist: 'Sonic Flow',
      album: 'Atmospheric Depths',
      genre: 'Lo-Fi Chill',
      durationSeconds: 182.0,
      fileSize: 4368000,
      mimeType: 'audio/mpeg',
      filePath: 'media/midnight-reverie.mp3',
      waveformData: generateSyntheticWaveform(120),
      uploaderId: artistUser.id
    },
    {
      title: 'Solar Flare Groove',
      artist: 'Sonic Flow',
      album: 'Cybernetic Echoes',
      genre: 'Electronic',
      durationSeconds: 245.2,
      fileSize: 5885000,
      mimeType: 'audio/mpeg',
      filePath: 'media/solar-flare.mp3',
      waveformData: generateSyntheticWaveform(120),
      uploaderId: artistUser.id
    }
  ];

  const createdTracks = [];
  for (const trackData of sampleTracks) {
    const track = await prisma.track.create({ data: trackData });
    createdTracks.push(track);
  }

  // 4. Create Playlist
  const playlist = await prisma.playlist.create({
    data: {
      title: 'Deep Focus & Ambient Beats',
      description: 'Hand-picked electronic and ambient tracks with pristine audio dynamics.',
      userId: listenerUser.id,
      isPublic: true,
      coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&fit=crop'
    }
  });

  for (let i = 0; i < createdTracks.length; i++) {
    await prisma.playlistTrack.create({
      data: {
        playlistId: playlist.id,
        trackId: createdTracks[i].id,
        position: i
      }
    });
  }

  // 5. Add Favorite
  await prisma.favorite.create({
    data: {
      userId: listenerUser.id,
      trackId: createdTracks[0].id
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
