// Importing PrismaClient from the Prisma package
import { PrismaClient } from '@prisma/client';

// Importing mockDeep and mockReset functions, and DeepMockProxy type from jest-mock-extended package
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

// Importing the prismaClient instance from the local prismaClient file
import prisma from '@/DAL/prismaClient';

// Mocking the prismaClient module to use a deep mock of PrismaClient
jest.mock('@/DAL/prismaClient', () => ({
    __esModule: true, // Indicates that the module is an ES module
    default: mockDeep<PrismaClient>(), // Provides a deeply mocked PrismaClient instance
}));

// Resetting the mock state before each test to ensure a clean slate
beforeEach(() => {
    mockReset(prismaMock); // Resets the mock state of prismaMock
});

// Exporting the mocked prisma instance as prismaMock with the type DeepMockProxy<PrismaClient>
export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;