// jest.setup.ts
import { jest } from '@jest/globals';
import { mockLogger } from './test-utils';

jest.mock('../src/lib/docs/logger', () => ({
  __esModule: true,
  default: mockLogger(),
}));

beforeEach(async () => {
  jest.clearAllMocks();
});

afterEach(async () => {
});
