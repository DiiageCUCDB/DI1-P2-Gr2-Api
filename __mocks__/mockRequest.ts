// mockRequest.ts
import { faker } from '@faker-js/faker';

// User registration request
export const generateMockUserRegistrationRequest = () => ({
  email: faker.internet.email(),
  name: faker.person.fullName(),
  password: faker.internet.password({ length: 10 }),
});

// User login request
export const generateMockUserLoginRequest = () => ({
  email: faker.internet.email(),
  password: faker.internet.password({ length: 10 }),
});

// User response
export const generateMockUserResponse = () => ({
  id: faker.number.int({ min: 1, max: 1000 }),
  email: faker.internet.email(),
  name: faker.person.fullName(),
});

// Login response
export const generateMockLoginResponse = () => ({
  accessToken: faker.string.alphanumeric(32),
});
