import { faker } from '@faker-js/faker';
import { hashPassword } from '@/lib/hash';

// Generate mock users for seeding the database
export const users = Array.from({ length: 10 }, () => {
  const password = 'password123';
  const { hash, salt } = hashPassword(password);
  return {
    email: faker.internet.email(),
    name: faker.person.fullName(),
    password: hash,
    salt: salt,
  };
});
