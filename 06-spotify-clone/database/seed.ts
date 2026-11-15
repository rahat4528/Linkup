import { PrismaClient } from '@prisma/client';
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Audio Catalog database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'listener@music.local' },
    update: {},
    create: {
      email: 'listener@music.local',
      username: 'listener',
      name: 'Music Enthusiast',
      passwordHash
    }
  });

  const artist = await prisma.artist.create({
    data: {
      name: 'The Synthesizers',
      bio: 'Electronic and synth-wave pioneers.'
    }
  });

  const album = await prisma.album.create({
    data: {
      artistId: artist.id,
      title: 'Neon Odyssey',
      releaseYear: 2026
    }
  });

  const track1 = await prisma.track.create({
    data: {
      albumId: album.id,
      artistId: artist.id,
      title: 'Midnight Highway',
      durationMs: 215000,
      audioUrl: 'https://cdn.example.com/audio/midnight-highway.mp3',
      trackNumber: 1
    }
  });

  const track2 = await prisma.track.create({
    data: {
      albumId: album.id,
      artistId: artist.id,
      title: 'Digital Sunset',
      durationMs: 198000,
      audioUrl: 'https://cdn.example.com/audio/digital-sunset.mp3',
      trackNumber: 2
    }
  });

  const playlist = await prisma.playlist.create({
    data: {
      userId: user.id,
      title: 'Night Drive Favorites',
      description: 'Atmospheric synth tracks for late night listening.',
      tracks: {
        create: [
          { trackId: track1.id, position: 0 },
          { trackId: track2.id, position: 1 }
        ]
      }
    }
  });

  console.log('Seeded Spotify Clone database. Playlist:', playlist.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
