import { PrismaClient } from '@prisma/client';
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Email Client database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'user@linkup.local' },
    update: {},
    create: {
      email: 'user@linkup.local',
      username: 'user',
      name: 'Linkup Mailer',
      passwordHash
    }
  });

  const label = await prisma.emailLabel.upsert({
    where: {
      userId_name: {
        userId: user.id,
        name: 'Work'
      }
    },
    update: {},
    create: {
      userId: user.id,
      name: 'Work',
      color: '#10b981'
    }
  });

  const thread = await prisma.emailThread.create({
    data: {
      userId: user.id,
      normalizedSubject: 'Welcome to your new inbox',
      snippet: 'Welcome to Linkup Webmail. Your IMAP and SMTP integrations are operational.',
      folder: 'INBOX',
      isRead: false,
      isStarred: true,
      messages: {
        create: [
          {
            messageId: '<welcome_1@linkup.local>',
            from: 'system@linkup.local',
            to: ['user@linkup.local'],
            subject: 'Welcome to your new inbox',
            bodyText: 'Welcome to Linkup Webmail. Your IMAP and SMTP integrations are operational.',
            bodyHtml: '<p>Welcome to <strong>Linkup Webmail</strong>. Your IMAP and SMTP integrations are operational.</p>'
          }
        ]
      },
      labelAssignments: {
        create: [
          { labelId: label.id }
        ]
      }
    }
  });

  console.log('Email database seeded successfully. Thread:', thread.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
