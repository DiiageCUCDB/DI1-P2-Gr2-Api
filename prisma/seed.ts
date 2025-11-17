import prisma from '@/DAL/prismaClient';
import { closeServer } from '@/lib/express';
import { guilds, users, challenges, questions, answers, responseUsers } from '../__mocks__/mockSchema';

async function main() {
  console.log('Clearing existing data...');

  // --- CLEAR EXISTING DATA ---
  await prisma.responseUser.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.questions.deleteMany();
  await prisma.challenges.deleteMany();
  await prisma.users.deleteMany();
  await prisma.guilds.deleteMany();

  console.log('Seeding guilds...');
  await prisma.guilds.createMany({ data: guilds });

  console.log('Seeding users...');
  await prisma.users.createMany({ data: users });

  console.log('Seeding challenges...');
  await prisma.challenges.createMany({ data: challenges });

  console.log('Seeding questions...');
  await prisma.questions.createMany({ data: questions });

  console.log('Seeding answers...');
  await prisma.answer.createMany({ data: answers });

  console.log('Seeding user responses...');
  await prisma.responseUser.createMany({ data: responseUsers });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    closeServer();
  });
