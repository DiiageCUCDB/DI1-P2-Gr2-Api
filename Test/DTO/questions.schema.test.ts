import {
  QuestionSchema,
  QuestionSchemaDal,
  CreateQuestionSchema,
  UpdateQuestionSchema,
  QuestionIdSchema,
} from '@/DTO/questions.schema';
import {
  mockQuestionWithAnswers,
} from '../../__mocks__/custom/mockQuestion';
import { v4 as uuidv4 } from 'uuid';

describe('Question DTO Schemas', () => {
  const mockQuestionWithAnswersData = mockQuestionWithAnswers();

  describe('QuestionSchema', () => {
    it('should validate a complete question object without sensitive fields', () => {
      const result = QuestionSchema.safeParse(mockQuestionWithAnswersData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(mockQuestionWithAnswersData.id);
        expect(result.data.challengeId).toBe(mockQuestionWithAnswersData.challengeId);
        expect(result.data.questionText).toBe(mockQuestionWithAnswersData.questionText);
        expect(result.data.answers).toHaveLength(mockQuestionWithAnswersData.answers.length);
        
        // Should not include sensitive fields
        expect(result.data).not.toHaveProperty('points');
        expect(result.data).not.toHaveProperty('createdAt');
        expect(result.data).not.toHaveProperty('updatedAt');
        
        // answers should use AnswerSchema (without isCorrect, createdAt, updatedAt)
        result.data.answers.forEach(answer => {
          expect(answer).toHaveProperty('id');
          expect(answer).toHaveProperty('questionId');
          expect(answer).toHaveProperty('answer');
          expect(answer).not.toHaveProperty('isCorrect');
          expect(answer).not.toHaveProperty('createdAt');
          expect(answer).not.toHaveProperty('updatedAt');
        });
      }
    });

    it('should reject question with missing required fields', () => {
      const invalidQuestion = { ...mockQuestionWithAnswersData };
      delete (invalidQuestion as any).questionText;

      const result = QuestionSchema.safeParse(invalidQuestion);

      expect(result.success).toBe(false);
    });

    it('should reject question with invalid UUID', () => {
      const invalidQuestion = {
        ...mockQuestionWithAnswersData,
        id: 'invalid-uuid',
      };

      const result = QuestionSchema.safeParse(invalidQuestion);

      expect(result.success).toBe(false);
    });

    it('should reject question with non-string questionText', () => {
      const invalidQuestion = {
        ...mockQuestionWithAnswersData,
        questionText: 123, // should be string
      };

      const result = QuestionSchema.safeParse(invalidQuestion);

      expect(result.success).toBe(false);
    });

    it('should reject question with invalid answers array', () => {
      const invalidQuestion = {
        ...mockQuestionWithAnswersData,
        answers: 'not-an-array', // should be array
      };

      const result = QuestionSchema.safeParse(invalidQuestion);

      expect(result.success).toBe(false);
    });

    it('should reject question with empty answers array', () => {
      const invalidQuestion = {
        ...mockQuestionWithAnswersData,
        answers: [],
      };

      const result = QuestionSchema.safeParse(invalidQuestion);

      expect(result.success).toBe(false); // Assuming at least one answer is required
    });
  });

  describe('QuestionSchemaDal', () => {
    it('should validate a complete DAL question object with all fields', () => {
      const result = QuestionSchemaDal.safeParse(mockQuestionWithAnswersData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(mockQuestionWithAnswersData.id);
        expect(result.data.challengeId).toBe(mockQuestionWithAnswersData.challengeId);
        expect(result.data.questionText).toBe(mockQuestionWithAnswersData.questionText);
        expect(result.data.points).toBe(mockQuestionWithAnswersData.points);
        expect(result.data).toHaveProperty('createdAt');
        expect(result.data).toHaveProperty('updatedAt');
        expect(result.data.createdAt).toBeInstanceOf(Date);
        expect(result.data.updatedAt).toBeInstanceOf(Date);
        
        // answers should use AnswerSchemaDal (with all fields)
        result.data.answers.forEach(answer => {
          expect(answer).toHaveProperty('id');
          expect(answer).toHaveProperty('questionId');
          expect(answer).toHaveProperty('answer');
          expect(answer).toHaveProperty('isCorrect');
          expect(answer).toHaveProperty('createdAt');
          expect(answer).toHaveProperty('updatedAt');
        });
      }
    });

    it('should set default value for points when not provided', () => {
      const questionWithoutPoints = {
        id: mockQuestionWithAnswersData.id,
        challengeId: mockQuestionWithAnswersData.challengeId,
        questionText: mockQuestionWithAnswersData.questionText,
        answers: mockQuestionWithAnswersData.answers,
        createdAt: mockQuestionWithAnswersData.createdAt,
        updatedAt: mockQuestionWithAnswersData.updatedAt,
      };

      const result = QuestionSchemaDal.safeParse(questionWithoutPoints);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.points).toBe(0);
      }
    });

    it('should reject DAL question without timestamps', () => {
      const questionWithoutTimestamps = {
        id: mockQuestionWithAnswersData.id,
        challengeId: mockQuestionWithAnswersData.challengeId,
        questionText: mockQuestionWithAnswersData.questionText,
        answers: mockQuestionWithAnswersData.answers,
        points: mockQuestionWithAnswersData.points,
      };

      const result = QuestionSchemaDal.safeParse(questionWithoutTimestamps);

      expect(result.success).toBe(false);
    });

    it('should reject DAL question with invalid timestamp format', () => {
      const invalidQuestion = {
        ...mockQuestionWithAnswersData,
        createdAt: 'invalid-date',
      };

      const result = QuestionSchemaDal.safeParse(invalidQuestion);

      expect(result.success).toBe(false);
    });

    it('should reject DAL question with invalid points type', () => {
      const invalidQuestion = {
        ...mockQuestionWithAnswersData,
        points: 'high', // should be number
      };

      const result = QuestionSchemaDal.safeParse(invalidQuestion);

      expect(result.success).toBe(false);
    });

    it('should reject DAL question with invalid answers schema', () => {
      const invalidQuestion = {
        ...mockQuestionWithAnswersData,
        answers: [
          {
            id: 'valid-uuid',
            questionId: 'valid-uuid',
            // missing required 'answer' field
            isCorrect: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ],
      };

      const result = QuestionSchemaDal.safeParse(invalidQuestion);

      expect(result.success).toBe(false);
    });
  });

  describe('Schema Compatibility and Transformation', () => {
    it('should allow conversion from DAL schema to API schema', () => {
      const dalResult = QuestionSchemaDal.safeParse(mockQuestionWithAnswersData);
      expect(dalResult.success).toBe(true);

      if (dalResult.success) {
        const apiResult = QuestionSchema.safeParse(dalResult.data);
        expect(apiResult.success).toBe(true);
        
        if (apiResult.success) {
          // API schema should have fewer properties
          expect(apiResult.data).not.toHaveProperty('points');
          expect(apiResult.data).not.toHaveProperty('createdAt');
          expect(apiResult.data).not.toHaveProperty('updatedAt');
          
          // answers should be transformed to AnswerSchema
          apiResult.data.answers.forEach(answer => {
            expect(answer).not.toHaveProperty('isCorrect');
            expect(answer).not.toHaveProperty('createdAt');
            expect(answer).not.toHaveProperty('updatedAt');
          });
        }
      }
    });

    it('should not allow conversion from API schema to DAL schema', () => {
      const apiData = {
        id: mockQuestionWithAnswersData.id,
        challengeId: mockQuestionWithAnswersData.challengeId,
        questionText: mockQuestionWithAnswersData.questionText,
        answers: mockQuestionWithAnswersData.answers.map(answer => ({
          id: answer.id,
          questionId: answer.questionId,
          answer: answer.answer,
        })),
      };

      const apiResult = QuestionSchema.safeParse(apiData);
      expect(apiResult.success).toBe(true);

      if (apiResult.success) {
        const dalResult = QuestionSchemaDal.safeParse(apiResult.data);
        expect(dalResult.success).toBe(false); // Should fail without timestamps and points
      }
    });
  });

  describe('Nested Answer Validation', () => {
    it('should validate nested answers using AnswerSchemaSecret in QuestionSchema', () => {
      const questionWithInvalidAnswers = {
        ...mockQuestionWithAnswersData,
        answers: [
          {
            id: 'valid-uuid',
            questionId: 'valid-uuid',
            answer: 'Valid answer',
            // QuestionSchema uses AnswerSchemaSecret which should not allow isCorrect
            isCorrect: true,
          }
        ],
      };

      const result = QuestionSchema.safeParse(questionWithInvalidAnswers);

      expect(result.success).toBe(false); // Should fail because isCorrect is not allowed in AnswerSchemaSecret
    });

    it('should validate nested answers using AnswerSchemaDal in QuestionSchemaDal', () => {
      const questionWithValidDalAnswers = {
        ...mockQuestionWithAnswersData,
        answers: [
          {
            id: mockQuestionWithAnswersData.id,
            questionId: mockQuestionWithAnswersData.id,
            answer: 'Valid answer',
            isCorrect: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ],
      };

      const result = QuestionSchemaDal.safeParse(questionWithValidDalAnswers);

      expect(result.success).toBe(true);
    });

    it('should accept valid answers without isCorrect field in QuestionSchema', () => {
      const questionWithValidAnswers = {
        ...mockQuestionWithAnswersData,
        answers: [
          {
            id: uuidv4(),
            questionId: mockQuestionWithAnswersData.id,
            answer: 'Valid answer without isCorrect',
          }
        ],
      };

      const result = QuestionSchema.safeParse(questionWithValidAnswers);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.answers).toHaveLength(1);
        expect(result.data.answers[0]).not.toHaveProperty('isCorrect');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle question with many answers', () => {
      const questionWithManyAnswers = {
        ...mockQuestionWithAnswersData,
        answers: Array.from({ length: 10 }, (_, i) => ({
          id: uuidv4(),
          questionId: mockQuestionWithAnswersData.id,
          answer: `Answer ${i}`,
          isCorrect: i === 0, // first answer is correct
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      };

      const dalResult = QuestionSchemaDal.safeParse(questionWithManyAnswers);
      expect(dalResult.success).toBe(true);

      if (dalResult.success) {
        const apiResult = QuestionSchema.safeParse(dalResult.data);
        expect(apiResult.success).toBe(true);
        
        if (apiResult.success) {
          expect(apiResult.data.answers).toHaveLength(10);
        }
      }
    });

    it('should handle question with special characters in questionText', () => {
      const questionWithSpecialChars = {
        ...mockQuestionWithAnswersData,
        questionText: 'What is 2 + 2? 🧮 Calculate: ∫x² dx from 0 to 1',
      };

      const result = QuestionSchema.safeParse(questionWithSpecialChars);

      expect(result.success).toBe(true);
    });

    it('should handle very long question text', () => {
      const longQuestionText = 'A'.repeat(1000);
      const questionWithLongText = {
        ...mockQuestionWithAnswersData,
        questionText: longQuestionText,
      };

      const result = QuestionSchema.safeParse(questionWithLongText);

      expect(result.success).toBe(true);
    });
  });

  describe('CreateQuestionSchema', () => {
    it('should validate a creation object without id/timestamps and with minimal answer fields', () => {
      const createData = {
        challengeId: mockQuestionWithAnswersData.challengeId,
        questionText: mockQuestionWithAnswersData.questionText,
        answers: mockQuestionWithAnswersData.answers.map(a => ({
          answer: a.answer,
          // include isCorrect if present in mock to be safe
          ...(a as any).isCorrect !== undefined ? { isCorrect: (a as any).isCorrect } : {},
        })),
      };

      const result = CreateQuestionSchema.safeParse(createData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).not.toHaveProperty('id');
        expect(Array.isArray(result.data.answers)).toBe(true);
        expect(result.data.answers).toHaveLength(createData.answers.length);
        result.data.answers.forEach(ans => {
          expect(ans).toHaveProperty('answer');
        });
      }
    });

    it('should reject creation object missing required fields', () => {
      const invalid = {
        challengeId: mockQuestionWithAnswersData.challengeId,
        // missing questionText
        answers: mockQuestionWithAnswersData.answers.map(a => ({ answer: a.answer })),
      };

      const result = CreateQuestionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject creation object with empty answers array', () => {
      const invalid = {
        challengeId: mockQuestionWithAnswersData.challengeId,
        questionText: mockQuestionWithAnswersData.questionText,
        answers: [],
      };

      const result = CreateQuestionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('UpdateQuestionSchema', () => {
    it('should allow partial updates (only questionText)', () => {
      const update = { questionText: 'Updated text' };
      const result = UpdateQuestionSchema.safeParse(update);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.questionText).toBe('Updated text');
      }
    });

    it('should allow an empty update object (all fields optional)', () => {
      const result = UpdateQuestionSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject update when provided fields have invalid types', () => {
      const invalid = { questionText: 123 as any };
      const result = UpdateQuestionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('QuestionIdSchema', () => {
    it('should validate a proper UUID id', () => {
      const id = uuidv4();
      const result = QuestionIdSchema.safeParse({ id });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(id);
      }
    });

    it('should reject an invalid UUID id', () => {
      const result = QuestionIdSchema.safeParse({ id: 'not-a-uuid' });
      expect(result.success).toBe(false);
    });
  });
});