import { PrismaClient, NoteStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Microblogging Platform database...');

  // Clean tables
  await prisma.notification.deleteMany();
  await prisma.block.deleteMany();
  await prisma.mute.deleteMany();
  await prisma.postEdit.deleteMany();
  await prisma.noteRating.deleteMany();
  await prisma.communityNote.deleteMany();
  await prisma.pollVote.deleteMany();
  await prisma.pollOption.deleteMany();
  await prisma.poll.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.like.deleteMany();
  await prisma.quotePost.deleteMany();
  await prisma.repost.deleteMany();
  await prisma.postMedia.deleteMany();
  await prisma.post.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create users
  const alex = await prisma.user.create({
    data: {
      email: 'alex@example.com',
      username: 'alexdev',
      name: 'Alex Rivera',
      passwordHash,
      profile: {
        create: {
          bio: 'Building scalable distributed systems. Writing about compilers & web runtimes.',
          location: 'San Francisco, CA',
          website: 'https://alexrivera.dev',
        },
      },
    },
  });

  const sarah = await prisma.user.create({
    data: {
      email: 'sarah@example.com',
      username: 'sarahcodes',
      name: 'Sarah Connor',
      passwordHash,
      profile: {
        create: {
          bio: 'AI researcher and open-source enthusiast.',
          location: 'Boston, MA',
        },
      },
    },
  });

  const david = await prisma.user.create({
    data: {
      email: 'david@example.com',
      username: 'davidtrends',
      name: 'David Tech',
      passwordHash,
      profile: {
        create: {
          bio: 'Real-time tech breaking news and ecosystem analysis.',
          location: 'London, UK',
        },
      },
    },
  });

  // 2. Follows
  await prisma.follow.create({
    data: { followerId: sarah.id, followingId: alex.id },
  });
  await prisma.follow.create({
    data: { followerId: david.id, followingId: alex.id },
  });

  // 3. Root Post with Interactive Poll by Alex
  const rootPost = await prisma.post.create({
    data: {
      id: 'post_root_demo',
      authorId: alex.id,
      text: 'Which web architecture paradigm are you betting on for 2026? Vote below #webdev #engineering',
      conversationId: 'post_root_demo',
      poll: {
        create: {
          expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          options: {
            create: [
              { index: 0, text: 'Server-Driven Microfrontends', votesCount: 142 },
              { index: 1, text: 'Edge Computing & WASM', votesCount: 310 },
              { index: 2, text: 'Local-First Reactive State', votesCount: 220 },
            ],
          },
        },
      },
      likes: {
        create: [{ userId: sarah.id }, { userId: david.id }],
      },
    },
  });

  // 4. Thread Replies
  const reply1 = await prisma.post.create({
    data: {
      id: 'post_reply_1',
      authorId: sarah.id,
      text: 'Local-first combined with edge synchronization is where the biggest gains are @alexdev.',
      conversationId: rootPost.id,
      parentId: rootPost.id,
    },
  });

  await prisma.post.create({
    data: {
      id: 'post_reply_2',
      authorId: alex.id,
      text: 'Completely agree @sarahcodes, CRDTs have matured significantly this year.',
      conversationId: rootPost.id,
      parentId: reply1.id,
    },
  });

  // 5. Community Note on Root Post
  await prisma.communityNote.create({
    data: {
      postId: rootPost.id,
      authorId: david.id,
      text: 'Context: W3C and TC39 have ratified standardized WASM component model specifications in early 2026.',
      status: NoteStatus.HELPFUL,
    },
  });

  console.log('Microblogging Platform database seeded successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
