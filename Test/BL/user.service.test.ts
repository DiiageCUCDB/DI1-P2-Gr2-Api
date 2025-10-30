import { createUser, findUserByEmail, findUsers, findUserById } from '@/BL/user.service';
import { mockUserWithId } from '../../__mocks__/mockService';
import { prismaMock } from '../../__mocks__/singleton';

describe('User Service', () => {
  describe('createUser', () => {
    it('should create a new user', async () => {
      const mockUser = mockUserWithId();

      prismaMock.users.create.mockResolvedValue(mockUser);

      const result = await createUser(mockUser);

      expect(result).toEqual(mockUser);
    });
  });

  describe('findUserByEmail', () => {
    it('should find a user by email', async () => {
      const mockUser = mockUserWithId();

      prismaMock.users.findUnique.mockResolvedValue(mockUser);

      const result = await findUserByEmail(mockUser.email);

      expect(result).toEqual(mockUser);
    });
  });

  describe('findUsers', () => {
    it('should find all users', async () => {
      const mockUser = [mockUserWithId(), mockUserWithId()];
      prismaMock.users.findMany.mockResolvedValue(mockUser);

      const result = await findUsers();

      expect(result).toEqual(mockUser);
    });
  });

  describe('findUserById', () => {
    it('should find a user by ID', async () => {
      const mockUser = mockUserWithId();

      prismaMock.users.findUnique.mockResolvedValue(mockUser);

      const result = await findUserById(mockUser.id);
      expect(result).toEqual(mockUser);
    });
    it('should return null if user not found', async () => {
      const mockUser = { ...mockUserWithId(), id: 9999 };
      prismaMock.users.findUnique.mockResolvedValue(null);
      const result = await findUserById(mockUser.id);
      expect(result).toBeNull();
    });
  });
});
