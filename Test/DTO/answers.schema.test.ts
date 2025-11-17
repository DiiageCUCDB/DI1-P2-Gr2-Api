import {
  AnswerSchema,
  AnswerSchemaDal,
  AnswerSchemaSecret,
  CreateAnswerSchema,
} from '@/DTO/answers.schema';
import {
  mockAnswerWithId,
} from '../../__mocks__/custom/mockAnswer';

describe('Answer DTO Schemas', () => {
  const mockAnswer = mockAnswerWithId();

  describe('AnswerSchema', () => {
    it('should validate a complete answer object without timestamp fields', () => {
      const result = AnswerSchema.safeParse(mockAnswer);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(mockAnswer.id);
        expect(result.data.questionId).toBe(mockAnswer.questionId);
        expect(result.data.answer).toBe(mockAnswer.answer);
        expect(result.data.isCorrect).toBe(mockAnswer.isCorrect);
        // Should not include timestamp fields
        expect(result.data).not.toHaveProperty('createdAt');
        expect(result.data).not.toHaveProperty('updatedAt');
      }
    });

    it('should reject answer with missing required fields', () => {
      const invalidAnswer = { ...mockAnswer };
      delete (invalidAnswer as any).answer;

      const result = AnswerSchema.safeParse(invalidAnswer);

      expect(result.success).toBe(false);
    });

    it('should reject answer with invalid UUID', () => {
      const invalidAnswer = {
        ...mockAnswer,
        id: 'invalid-uuid',
      };

      const result = AnswerSchema.safeParse(invalidAnswer);

      expect(result.success).toBe(false);
    });

    it('should reject answer with non-string answer text', () => {
      const invalidAnswer = {
        ...mockAnswer,
        answer: 123, // should be string
      };

      const result = AnswerSchema.safeParse(invalidAnswer);

      expect(result.success).toBe(false);
    });
  });

  describe('AnswerSchemaSecret', () => {
    it('should validate an answer object without isCorrect and timestamp fields', () => {
      const result = AnswerSchemaSecret.safeParse(mockAnswer);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(mockAnswer.id);
        expect(result.data.questionId).toBe(mockAnswer.questionId);
        expect(result.data.answer).toBe(mockAnswer.answer);
        // Should not include sensitive fields
        expect(result.data).not.toHaveProperty('isCorrect');
        expect(result.data).not.toHaveProperty('createdAt');
        expect(result.data).not.toHaveProperty('updatedAt');
      }
    });

    it('should reject answer with missing required fields', () => {
      const invalidAnswer = { ...mockAnswer };
      delete (invalidAnswer as any).answer;

      const result = AnswerSchemaSecret.safeParse(invalidAnswer);

      expect(result.success).toBe(false);
    });

    it('should reject answer with invalid UUID', () => {
      const invalidAnswer = {
        ...mockAnswer,
        id: 'invalid-uuid',
      };

      const result = AnswerSchemaSecret.safeParse(invalidAnswer);

      expect(result.success).toBe(false);
    });

    it('should have exactly 3 properties (id, questionId, answer)', () => {
      const result = AnswerSchemaSecret.safeParse(mockAnswer);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(Object.keys(result.data)).toHaveLength(3);
        expect(result.data).toHaveProperty('id');
        expect(result.data).toHaveProperty('questionId');
        expect(result.data).toHaveProperty('answer');
      }
    });
  });

  describe('AnswerSchemaDal', () => {
    it('should validate a complete DAL answer object with all fields', () => {
      const result = AnswerSchemaDal.safeParse(mockAnswer);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(mockAnswer.id);
        expect(result.data.questionId).toBe(mockAnswer.questionId);
        expect(result.data.answer).toBe(mockAnswer.answer);
        expect(result.data.isCorrect).toBe(mockAnswer.isCorrect);
        expect(result.data).toHaveProperty('createdAt');
        expect(result.data).toHaveProperty('updatedAt');
        expect(result.data.createdAt).toBeInstanceOf(Date);
        expect(result.data.updatedAt).toBeInstanceOf(Date);
      }
    });

    it('should set default value for isCorrect when not provided', () => {
      const answerWithoutIsCorrect = {
        id: mockAnswer.id,
        questionId: mockAnswer.questionId,
        answer: mockAnswer.answer,
        createdAt: mockAnswer.createdAt,
        updatedAt: mockAnswer.updatedAt,
      };

      const result = AnswerSchemaDal.safeParse(answerWithoutIsCorrect);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isCorrect).toBe(false);
      }
    });

    it('should reject DAL answer without timestamps', () => {
      const answerWithoutTimestamps = {
        id: mockAnswer.id,
        questionId: mockAnswer.questionId,
        answer: mockAnswer.answer,
        isCorrect: mockAnswer.isCorrect,
      };

      const result = AnswerSchemaDal.safeParse(answerWithoutTimestamps);

      expect(result.success).toBe(false);
    });

    it('should reject DAL answer with invalid timestamp format', () => {
      const invalidAnswer = {
        ...mockAnswer,
        createdAt: 'invalid-date',
      };

      const result = AnswerSchemaDal.safeParse(invalidAnswer);

      expect(result.success).toBe(false);
    });

    it('should reject DAL answer with invalid isCorrect type', () => {
      const invalidAnswer = {
        ...mockAnswer,
        isCorrect: 'yes', // should be boolean
      };

      const result = AnswerSchemaDal.safeParse(invalidAnswer);

      expect(result.success).toBe(false);
    });
  });

  describe('Schema Compatibility', () => {
    it('should allow conversion from DAL schema to API schema', () => {
      const dalResult = AnswerSchemaDal.safeParse(mockAnswer);
      expect(dalResult.success).toBe(true);

      if (dalResult.success) {
        const apiResult = AnswerSchema.safeParse(dalResult.data);
        expect(apiResult.success).toBe(true);
        
        if (apiResult.success) {
          // API schema should have fewer properties (omits timestamps but keeps isCorrect)
          expect(Object.keys(apiResult.data)).toHaveLength(4); // id, questionId, answer, isCorrect
          expect(apiResult.data).toHaveProperty('isCorrect');
          expect(apiResult.data).not.toHaveProperty('createdAt');
          expect(apiResult.data).not.toHaveProperty('updatedAt');
        }
      }
    });

    it('should not allow conversion from API schema to DAL schema', () => {
      const apiData = {
        id: mockAnswer.id,
        questionId: mockAnswer.questionId,
        answer: mockAnswer.answer,
      };

      const apiResult = AnswerSchema.safeParse(apiData);
      expect(apiResult.success).toBe(true);

      if (apiResult.success) {
        const dalResult = AnswerSchemaDal.safeParse(apiResult.data);
        expect(dalResult.success).toBe(false); // Should fail without timestamps
      }
    });
  });
  describe('CreateAnswerSchema', () => {
    it('should validate creation object with answer only and default isCorrect to false', () => {
      const createData = {
        answer: mockAnswer.answer,
      };

      const result = CreateAnswerSchema.safeParse(createData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.answer).toBe(createData.answer);
        expect(result.data.isCorrect).toBe(false);
        expect(Object.keys(result.data)).toHaveLength(2);
        expect(result.data).toHaveProperty('answer');
        expect(result.data).toHaveProperty('isCorrect');
      }
    });

    it('should validate creation object with explicit isCorrect value', () => {
      const createData = {
        answer: mockAnswer.answer,
        isCorrect: true,
      };

      const result = CreateAnswerSchema.safeParse(createData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.answer).toBe(createData.answer);
        expect(result.data.isCorrect).toBe(true);
      }
    });

    it('should reject creation object missing answer', () => {
      const createData = {
        isCorrect: true,
      };

      const result = CreateAnswerSchema.safeParse(createData);

      expect(result.success).toBe(false);
    });

    it('should reject creation object with non-string answer', () => {
      const createData = {
        answer: 123,
      };

      const result = CreateAnswerSchema.safeParse(createData);

      expect(result.success).toBe(false);
    });

    it('should strip id and questionId if provided and only return answer and isCorrect', () => {
      const createData = {
        id: mockAnswer.id,
        questionId: mockAnswer.questionId,
        answer: mockAnswer.answer,
        isCorrect: true,
      };

      const result = CreateAnswerSchema.safeParse(createData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.answer).toBe(createData.answer);
        expect(result.data.isCorrect).toBe(true);
        // Ensure extraneous fields are not present
        expect((result.data as any)).not.toHaveProperty('id');
        expect((result.data as any)).not.toHaveProperty('questionId');
        expect(Object.keys(result.data)).toHaveLength(2);
      }
    });
  });
});