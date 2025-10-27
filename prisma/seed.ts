import prisma from '@/DAL/prismaClient';
import { closeServer } from '@/lib/express';
import {
  users
} from '../__mocks__/mockSchema';

async function main() {
  await prisma.users.createMany({ data: users });
}

// Execute the main function and handle errors
main()
  .then(() => console.log('Seeding completed!')) // Log success message
  .catch((e) => console.error(e)) // Log any errors
  .finally(() => {
    prisma.$disconnect(); // Disconnect the Prisma client
    closeServer(); // Close the server
  });
