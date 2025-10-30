import { faker } from '@faker-js/faker';

// Helper function to generate mock User data with ID
export const mockUserWithId = () => ({
  id: faker.number.int({ min: 1, max: 1000 }),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  password: faker.internet.password({ length: 10 }),
  salt: faker.string.alphanumeric(16),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
});


