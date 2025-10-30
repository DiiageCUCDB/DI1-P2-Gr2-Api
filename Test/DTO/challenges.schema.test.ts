import {
  ChallengeSchema,
  ChallengeSchemaDal,
  CreateChallengeSchema,
  UpdateChallengeSchema,
  GetChallengesResponseSchema,
  ChallengeIdSchema,
} from '@/DTO/challenges.schema';
import { challenges } from '../../__mocks__/mockSchema';

describe('Challenge DTO Schemas', () => {
  const mockChallenge = challenges[0]!;
  const mockChallengeWithTimestamps = {
    ...mockChallenge,
    createdAt: new Date('2023-10-01T12:00:00.000Z'),
    updatedAt: new Date('2023-10-02T12:00:00.000Z'),
  };

  describe('ChallengeSchema', () => {
    it('should validate a complete challenge object', () => {
      const result = ChallengeSchema.safeParse(mockChallenge);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockChallenge);
      }
    });

    it('should reject challenge with missing required fields', () => {
      const invalidChallenge = { ...mockChallenge };
      delete (invalidChallenge as any).name;

      const result = ChallengeSchema.safeParse(invalidChallenge);

      expect(result.success).toBe(false);
    });

    it('should reject challenge with invalid UUID', () => {
      const invalidChallenge = {
        ...mockChallenge,
        id: 'invalid-uuid',
      };

      const result = ChallengeSchema.safeParse(invalidChallenge);

      expect(result.success).toBe(false);
    });

    it('should reject challenge with invalid difficulty (non-number)', () => {
      const invalidChallenge = {
        ...mockChallenge,
        difficulty: 'hard',
      };

      const result = ChallengeSchema.safeParse(invalidChallenge);

      expect(result.success).toBe(false);
    });
  });

  describe('ChallengeSchemaDal', () => {
    it('should validate a complete DAL challenge object with timestamps', () => {
      const result = ChallengeSchemaDal.safeParse(mockChallengeWithTimestamps);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockChallengeWithTimestamps);
      }
    });

    it('should reject DAL challenge without timestamps', () => {
      const result = ChallengeSchemaDal.safeParse(mockChallenge);

      expect(result.success).toBe(false);
    });

    it('should reject DAL challenge with invalid timestamp format', () => {
      const invalidChallenge = {
        ...mockChallengeWithTimestamps,
        createdAt: 'invalid-date',
      };

      const result = ChallengeSchemaDal.safeParse(invalidChallenge);

      expect(result.success).toBe(false);
    });
  });

  describe('CreateChallengeSchema', () => {
    it('should validate create challenge data without ID and timestamps', () => {
      const { id: _id, ...createData } = mockChallenge;

      const result = CreateChallengeSchema.safeParse(createData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(createData);
        expect(result.data).not.toHaveProperty('id');
        expect(result.data).not.toHaveProperty('createdAt');
        expect(result.data).not.toHaveProperty('updatedAt');
      }
    });

    it('should reject create challenge with ID provided', () => {
      const result = CreateChallengeSchema.safeParse(mockChallenge);

      expect(result.success).toBe(false);
    });

    it('should set default value for isGuildChallenge', () => {
      const { id: _id, isGuildChallenge: _isGuildChallenge, ...createData } = mockChallenge;

      const result = CreateChallengeSchema.safeParse(createData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isGuildChallenge).toBe(false);
      }
    });
  });

  describe('UpdateChallengeSchema', () => {
    it('should validate partial update data', () => {
      const updateData = {
        name: 'Updated Name',
        difficulty: 4,
      };

      const result = UpdateChallengeSchema.safeParse(updateData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(updateData);
      }
    });

    it('should validate empty update object', () => {
      const result = UpdateChallengeSchema.safeParse({});

      expect(result.success).toBe(true);
    });

    it('should reject update with invalid field types', () => {
      const invalidUpdate = {
        difficulty: 'very hard',
      };

      const result = UpdateChallengeSchema.safeParse(invalidUpdate);

      expect(result.success).toBe(false);
    });

    it('should reject update with extra fields', () => {
      const updateWithExtra = {
        name: 'Updated Name',
        extraField: 'should not be here',
      };

      const result = UpdateChallengeSchema.safeParse(updateWithExtra);

      expect(result.success).toBe(false);
    });
  });

  describe('GetChallengesResponseSchema', () => {
    it('should validate challenges response with pagination', () => {
      const responseData = {
        challenges: [mockChallenge],
        totalChallenges: 1,
        totalPages: 1,
        currentPage: 1,
      };

      const result = GetChallengesResponseSchema.safeParse(responseData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(responseData);
      }
    });

    it('should reject response with invalid pagination data', () => {
      const invalidResponse = {
        challenges: [mockChallenge],
        totalChallenges: 'one',
        totalPages: 1,
        currentPage: 1,
      };

      const result = GetChallengesResponseSchema.safeParse(invalidResponse);

      expect(result.success).toBe(false);
    });

    it('should reject response with missing pagination fields', () => {
      const invalidResponse = {
        challenges: [mockChallenge],
        totalChallenges: 1,
        // missing totalPages and currentPage
      };

      const result = GetChallengesResponseSchema.safeParse(invalidResponse);

      expect(result.success).toBe(false);
    });
  });

  describe('ChallengeIdSchema', () => {
    it('should validate challenge ID object', () => {
      const validId = { id: mockChallenge.id };

      const result = ChallengeIdSchema.safeParse(validId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validId);
      }
    });

    it('should reject invalid UUID format', () => {
      const invalidId = { id: 'invalid-uuid' };

      const result = ChallengeIdSchema.safeParse(invalidId);

      expect(result.success).toBe(false);
    });

    it('should reject missing ID field', () => {
      const invalidId = {};

      const result = ChallengeIdSchema.safeParse(invalidId);

      expect(result.success).toBe(false);
    });
  });
});