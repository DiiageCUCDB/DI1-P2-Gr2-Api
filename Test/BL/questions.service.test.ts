import {
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from '@/BL/questions.service';
import { prismaMock } from '../../__mocks__/singleton';
import {
  mockQuestionWithId,
  mockCreateQuestionData,
  mockUpdateQuestionData,
} from '../../__mocks__/custom/mockQuestion';
import { UpdateQuestionSchemaType } from '@/DTO/questions.schema';

describe('Question Service', () => {
  // Create fresh instances in each test to avoid mutation issues
  const getMockQuestion = () => mockQuestionWithId();
  const getMockCreateData = () => mockCreateQuestionData();
  const getMockUpdateData = () => mockUpdateQuestionData();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createQuestion', () => {
    it('should create a new question with answers successfully', async () => {
      const mockQuestion = getMockQuestion();
      const mockCreateData = getMockCreateData();
      
      // Mock the transaction
      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          questions: {
            create: jest.fn().mockResolvedValue(mockQuestion),
          },
          answer: {
            create: jest.fn().mockImplementation((data: any) => 
              Promise.resolve({
                id: 'answer-id',
                ...data.data,
                createdAt: new Date(),
                updatedAt: new Date(),
              })
            ),
          },
        };
        return callback(tx as any);
      });

      const result = await createQuestion(mockCreateData);

      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('answers');
      expect(result.answers).toBeInstanceOf(Array);
      expect(result.answers.length).toBeGreaterThan(0);
    });

    it('should handle errors when creating question fails', async () => {
      const mockCreateData = getMockCreateData();
      const error = new Error('Database error');
      prismaMock.$transaction.mockRejectedValue(error);

      await expect(createQuestion(mockCreateData)).rejects.toThrow('Database error');
    });
  });

  describe('updateQuestion', () => {
    it('should update question with answers successfully', async () => {
      const mockQuestion = getMockQuestion();
      const mockUpdateData = getMockUpdateData();
      
      // Mock the transaction
      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          questions: {
            update: jest.fn().mockResolvedValue(mockQuestion),
          },
          answer: {
            deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
            create: jest.fn().mockImplementation((data: any) => 
              Promise.resolve({
                id: 'answer-id',
                ...data.data,
                createdAt: new Date(),
                updatedAt: new Date(),
              })
            ),
          },
        };
        return callback(tx as any);
      });

      const result = await updateQuestion(mockQuestion.id, mockUpdateData as UpdateQuestionSchemaType);

      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
    });

    it('should update question without answers when answers is not provided', async () => {
      const mockQuestion = getMockQuestion();
      const partialUpdate = { questionText: 'Updated question text' };
      
      // Mock the transaction
      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          questions: {
            update: jest.fn().mockResolvedValue({ ...mockQuestion, ...partialUpdate }),
          },
          answer: {
            deleteMany: jest.fn(),
            create: jest.fn(),
          },
        };
        return callback(tx as any);
      });

      const result = await updateQuestion(mockQuestion.id, partialUpdate);

      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(result.questionText).toBe(partialUpdate.questionText);
    });

    it('should handle errors when updating question fails', async () => {
      const mockQuestion = getMockQuestion();
      const mockUpdateData = getMockUpdateData();
      const error = new Error('Database error');
      prismaMock.$transaction.mockRejectedValue(error);

      await expect(updateQuestion(mockQuestion.id, mockUpdateData as UpdateQuestionSchemaType))
        .rejects.toThrow('Database error');
    });
  });

  describe('deleteQuestion', () => {
    it('should delete question with answers successfully', async () => {
      const mockQuestion = getMockQuestion();
      
      // Mock the transaction
      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          answer: {
            deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
          },
          questions: {
            delete: jest.fn().mockResolvedValue(mockQuestion),
          },
        };
        return callback(tx as any);
      });

      await deleteQuestion(mockQuestion.id);

      expect(prismaMock.$transaction).toHaveBeenCalled();
    });

    it('should handle errors when deleting question fails', async () => {
      const mockQuestion = getMockQuestion();
      const error = new Error('Database error');
      prismaMock.$transaction.mockRejectedValue(error);

      await expect(deleteQuestion(mockQuestion.id)).rejects.toThrow('Database error');
    });
  });
});