import { PrismaClient } from '@prisma/client';
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Real-Time Chat database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'alice@chat.local' },
    update: {},
    create: {
      email: 'alice@chat.local',
      username: 'alice',
      name: 'Alice Johnson',
      passwordHash
    }
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@chat.local' },
    update: {},
    create: {
      email: 'bob@chat.local',
      username: 'bob',
      name: 'Bob Smith',
      passwordHash
    }
  });

  const directConv = await prisma.conversation.create({
    data: {
      type: 'DIRECT',
      members: {
        create: [
          { userId: user1.id, role: 'MEMBER' },
          { userId: user2.id, role: 'MEMBER' }
        ]
      }
    }
  });

  await prisma.message.create({
    data: {
      conversationId: directConv.id,
      senderId: user1.id,
      content: 'Hey Bob, welcome to the real-time chat service!',
      receipts: {
        create: [
          { userId: user2.id, status: 'DELIVERED' }
        ]
      }
    }
  });

  console.log('Chat database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
