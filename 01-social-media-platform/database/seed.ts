import { PrismaClient, Visibility, GroupPrivacy, GroupRole, ReactionType, RsvpStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Social Media Platform database...');

  // 1. Clean existing records in reverse dependency order
  await prisma.notification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.communityListing.deleteMany();
  await prisma.eventRsvp.deleteMany();
  await prisma.event.deleteMany();
  await prisma.story.deleteMany();
  await prisma.shareRecord.deleteMany();
  await prisma.savedPost.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.postMedia.deleteMany();
  await prisma.post.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.group.deleteMany();
  await prisma.block.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.friendRequest.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 2. Create seed users
  const alice = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      username: 'alice',
      name: 'Alice Johnson',
      passwordHash,
      profile: {
        create: {
          bio: 'Community builder & open source contributor.',
          location: 'San Francisco, CA',
          work: 'Principal Architect at TechCorp',
          education: 'Stanford University',
          profilePrivacy: Visibility.PUBLIC,
        },
      },
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      username: 'bob',
      name: 'Bob Smith',
      passwordHash,
      profile: {
        create: {
          bio: 'Frontend developer & digital art explorer.',
          location: 'New York, NY',
          work: 'Design Technologist',
          education: 'NYU Courant',
          profilePrivacy: Visibility.PUBLIC,
        },
      },
    },
  });

  const charlie = await prisma.user.create({
    data: {
      email: 'charlie@example.com',
      username: 'charlie',
      name: 'Charlie Davis',
      passwordHash,
      profile: {
        create: {
          bio: 'Database systems & distributed platforms.',
          location: 'Seattle, WA',
          work: 'Database Engineer',
          education: 'University of Washington',
          profilePrivacy: Visibility.FRIENDS,
        },
      },
    },
  });

  const dana = await prisma.user.create({
    data: {
      email: 'dana@example.com',
      username: 'dana',
      name: 'Dana Vance',
      passwordHash,
      profile: {
        create: {
          bio: 'DevOps & Cloud infrastructure specialist.',
          location: 'Austin, TX',
          work: 'Site Reliability Lead',
          education: 'UT Austin',
          profilePrivacy: Visibility.PUBLIC,
        },
      },
    },
  });

  // 3. Create Friendships: Alice <-> Bob, Alice <-> Charlie
  await prisma.friendship.createMany({
    data: [
      { userAId: alice.id, userBId: bob.id },
      { userAId: bob.id, userBId: alice.id },
      { userAId: alice.id, userBId: charlie.id },
      { userAId: charlie.id, userBId: alice.id },
    ],
  });

  // 4. Pending Friend Request: Dana -> Alice
  await prisma.friendRequest.create({
    data: {
      senderId: dana.id,
      receiverId: alice.id,
    },
  });

  // 5. Follow link: Bob follows Dana
  await prisma.follow.create({
    data: {
      followerId: bob.id,
      followingId: dana.id,
    },
  });

  // 6. Public Group & Membership
  const techGroup = await prisma.group.create({
    data: {
      name: 'Modern Web Architecture',
      description: 'Discussing distributed web architectures and reactive applications.',
      privacy: GroupPrivacy.PUBLIC,
      creatorId: alice.id,
      members: {
        create: [
          { userId: alice.id, role: GroupRole.OWNER },
          { userId: bob.id, role: GroupRole.ADMIN },
          { userId: charlie.id, role: GroupRole.MEMBER },
        ],
      },
    },
  });

  // 7. Private Group
  const privateGroup = await prisma.group.create({
    data: {
      name: 'Exclusive Founders Circle',
      description: 'Private discussions for startup founders.',
      privacy: GroupPrivacy.PRIVATE,
      creatorId: bob.id,
      members: {
        create: [
          { userId: bob.id, role: GroupRole.OWNER },
          { userId: charlie.id, role: GroupRole.MEMBER },
        ],
      },
    },
  });

  // 8. Posts
  const post1 = await prisma.post.create({
    data: {
      authorId: alice.id,
      content: 'Welcome to our community platform! Excited to connect with everyone here.',
      visibility: Visibility.PUBLIC,
      reactions: {
        create: [
          { userId: bob.id, type: ReactionType.LOVE },
          { userId: charlie.id, type: ReactionType.CELEBRATE },
        ],
      },
      comments: {
        create: [
          {
            authorId: bob.id,
            content: 'Thrilled to be here! The clean architecture looks solid.',
          },
        ],
      },
    },
  });

  const post2 = await prisma.post.create({
    data: {
      authorId: alice.id,
      content: 'Private thoughts shared only with mutual friends.',
      visibility: Visibility.FRIENDS,
    },
  });

  // 9. Community Event
  await prisma.event.create({
    data: {
      title: 'Global Community Summit 2026',
      description: 'Annual gathering for social web builders and enthusiasts.',
      location: 'Virtual Main Stage',
      eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      creatorId: alice.id,
      rsvps: {
        create: [
          { userId: alice.id, status: RsvpStatus.GOING },
          { userId: bob.id, status: RsvpStatus.GOING },
          { userId: charlie.id, status: RsvpStatus.INTERESTED },
        ],
      },
    },
  });

  // 10. Ephemeral 24h Story
  await prisma.story.create({
    data: {
      authorId: bob.id,
      mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
      caption: 'Sunset at Ocean Beach!',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
