import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Linkup Meme Generator Database...');

  // Clean existing records
  await prisma.favorite.deleteMany();
  await prisma.meme.deleteMany();
  await prisma.template.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Creator User
  const creator = await prisma.user.create({
    data: {
      email: 'creator@linkup-memes.local',
      username: 'memelord',
      displayName: 'Captain Meme',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&fit=crop'
    }
  });

  // 2. Create Standard Meme Templates
  const templates = [
    {
      name: 'Two Diverging Paths',
      slug: 'two-diverging-paths',
      imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&fit=crop',
      width: 600,
      height: 600,
      category: 'Decisions',
      defaultBoxCount: 2,
      usageCount: 1540
    },
    {
      name: 'Eureka Breakthrough',
      slug: 'eureka-breakthrough',
      imageUrl: 'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?w=600&fit=crop',
      width: 600,
      height: 600,
      category: 'Reactions',
      defaultBoxCount: 2,
      usageCount: 2310
    },
    {
      name: 'Unshakable Optimism',
      slug: 'unshakable-optimism',
      imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&fit=crop',
      width: 600,
      height: 600,
      category: 'Classic',
      defaultBoxCount: 2,
      usageCount: 980
    }
  ];

  const createdTemplates = [];
  for (const t of templates) {
    const tmpl = await prisma.template.create({ data: t });
    createdTemplates.push(tmpl);
  }

  // 3. Create Sample Meme
  const sampleMeme = await prisma.meme.create({
    data: {
      title: 'Deploying on Friday Evening',
      templateId: createdTemplates[0].id,
      creatorId: creator.id,
      imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&fit=crop',
      layersJson: [
        {
          id: 'text-top',
          type: 'text',
          text: 'WRITE TESTS BEFORE DEPLOYING',
          x: 300,
          y: 60,
          fontSize: 32,
          fontFamily: 'Impact',
          color: '#ffffff',
          strokeColor: '#000000',
          strokeWidth: 4,
          align: 'center'
        },
        {
          id: 'text-bottom',
          type: 'text',
          text: 'PUSH DIRECTLY TO PRODUCTION',
          x: 300,
          y: 520,
          fontSize: 32,
          fontFamily: 'Impact',
          color: '#ffffff',
          strokeColor: '#000000',
          strokeWidth: 4,
          align: 'center'
        }
      ],
      isPublic: true,
      upvotes: 84
    }
  });

  await prisma.favorite.create({
    data: {
      userId: creator.id,
      memeId: sampleMeme.id
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
