import { PrismaClient, MediaStatus, MediaType, StoryAudience } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Visual Media Discovery Platform database...');

  // Clean tables
  await prisma.notification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.block.deleteMany();
  await prisma.savedPost.deleteMany();
  await prisma.directMessage.deleteMany();
  await prisma.reel.deleteMany();
  await prisma.storyView.deleteMany();
  await prisma.story.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.postHashtag.deleteMany();
  await prisma.hashtag.deleteMany();
  await prisma.postMedia.deleteMany();
  await prisma.post.deleteMany();
  await prisma.followRequest.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create creators
  const elena = await prisma.user.create({
    data: {
      email: 'elena@example.com',
      username: 'elenaphotos',
      name: 'Elena Rostova',
      passwordHash,
      profile: {
        create: {
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
          bio: 'Landscape & Architectural Photographer 📷 | Worldwide wanderer',
          website: 'https://elenarostova.photography',
          isPrivate: false,
          isVerified: true,
        },
      },
    },
  });

  const marcus = await prisma.user.create({
    data: {
      email: 'marcus@example.com',
      username: 'marcuscreative',
      name: 'Marcus Chen',
      passwordHash,
      profile: {
        create: {
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
          bio: 'Visual designer, 3D artist & motion creator.',
          isPrivate: false,
        },
      },
    },
  });

  const sophia = await prisma.user.create({
    data: {
      email: 'sophia@example.com',
      username: 'sophiaprivate',
      name: 'Sophia Laurent',
      passwordHash,
      profile: {
        create: {
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
          bio: 'Private visual journal for friends & family.',
          isPrivate: true,
        },
      },
    },
  });

  // 2. Follow relationships: Marcus follows Elena
  await prisma.follow.create({
    data: {
      followerId: marcus.id,
      followingId: elena.id,
    },
  });

  // 3. Hashtags
  const tagTravel = await prisma.hashtag.create({ data: { tag: 'travel', postsCount: 1 } });
  const tagArchitecture = await prisma.hashtag.create({ data: { tag: 'architecture', postsCount: 1 } });
  const tagSunset = await prisma.hashtag.create({ data: { tag: 'sunset', postsCount: 1 } });

  // 4. Multi-image Carousel Post by Elena
  const post1 = await prisma.post.create({
    data: {
      authorId: elena.id,
      caption: 'Dawn reflections at Lake Como. The silence before sunrise is pure magic. #travel #architecture',
      location: 'Lake Como, Italy',
      status: MediaStatus.READY,
      media: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1080',
            thumbnailUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=400',
            type: MediaType.IMAGE,
            order: 0,
          },
          {
            url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1080',
            thumbnailUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400',
            type: MediaType.IMAGE,
            order: 1,
          },
        ],
      },
      hashtags: {
        create: [
          { hashtagId: tagTravel.id },
          { hashtagId: tagArchitecture.id },
        ],
      },
      reactions: {
        create: [{ userId: marcus.id }],
      },
      comments: {
        create: [
          {
            authorId: marcus.id,
            content: 'The color grading on that second frame is breathtaking!',
          },
        ],
      },
    },
  });

  // 5. Active Ephemeral Story (24h)
  await prisma.story.create({
    data: {
      authorId: elena.id,
      mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
      caption: 'Exploring coastal cliffs today! 🌊',
      audience: StoryAudience.EVERYONE,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      views: {
        create: [{ viewerId: marcus.id }],
      },
    },
  });

  // 6. Vertical Short Video (Reel)
  await prisma.reel.create({
    data: {
      authorId: marcus.id,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      caption: 'Quick behind the scenes timelapse of my motion design process #3d #creative',
      audioTrack: 'Original Synthwave Beat',
      viewsCount: 1420,
      likesCount: 389,
    },
  });

  console.log('Visual Media Discovery Platform database seeded.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
