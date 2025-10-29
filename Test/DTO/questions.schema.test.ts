import {
  QuestionSchema,
  QuestionSchemaDal,
} from '@/DTO/questions.schema';
import {
  mockQuestionWithAnswers,
} from '../../__mocks__/custom/mockQuestion';

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
        expect(result.data.answerText).toHaveLength(mockQuestionWithAnswersData.answerText.length);
        
        // Should not include sensitive fields
        expect(result.data).not.toHaveProperty('points');
        expect(result.data).not.toHaveProperty('createdAt');
        expect(result.data).not.toHaveProperty('updatedAt');
        
        // AnswerText should use AnswerSchema (without isCorrect, createdAt, updatedAt)
        result.data.answerText.forEach(answer => {
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

    it('should reject question with invalid answerText array', () => {
      const invalidQuestion = {
        ...mockQuestionWithAnswersData,
        answerText: 'not-an-array', // should be array
      };

      const result = QuestionSchema.safeParse(invalidQuestion);

      expect(result.success).toBe(false);
    });

    it('should reject question with empty answerText array', () => {
      const invalidQuestion = {
        ...mockQuestionWithAnswersData,
        answerText: [],
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
        
        // AnswerText should use AnswerSchemaDal (with all fields)
        result.data.answerText.forEach(answer => {
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
        answerText: mockQuestionWithAnswersData.answerText,
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
        answerText: mockQuestionWithAnswersData.answerText,
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

    it('should reject DAL question with invalid answerText schema', () => {
      const invalidQuestion = {
        ...mockQuestionWithAnswersData,
        answerText: [
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
          
          // AnswerText should be transformed to AnswerSchema
          apiResult.data.answerText.forEach(answer => {
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
        answerText: mockQuestionWithAnswersData.answerText.map(answer => ({
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
    it('should validate nested answers using AnswerSchema in QuestionSchema', () => {
      const questionWithInvalidAnswers = {
        ...mockQuestionWithAnswersData,
        answerText: [
          {
            id: 'valid-uuid',
            questionId: 'valid-uuid',
            answer: 'Valid answer',
            // API schema should not allow isCorrect
            isCorrect: true,
          }
        ],
      };

      const result = QuestionSchema.safeParse(questionWithInvalidAnswers);

      expect(result.success).toBe(false); // Should fail because isCorrect is not allowed in AnswerSchema
    });

    it('should validate nested answers using AnswerSchemaDal in QuestionSchemaDal', () => {
      const questionWithValidDalAnswers = {
        ...mockQuestionWithAnswersData,
        answerText: [
          {
            id: 'valid-uuid',
            questionId: 'valid-uuid',
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
  });

  describe('Edge Cases', () => {
    it('should handle question with many answers', () => {
      const questionWithManyAnswers = {
        ...mockQuestionWithAnswersData,
        answerText: Array.from({ length: 10 }, (_, i) => ({
          id: `answer-${i}`,
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
          expect(apiResult.data.answerText).toHaveLength(10);
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
});