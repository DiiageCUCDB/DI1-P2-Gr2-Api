import {
  createChallenge,
  getChallenges,
  getChallengeById,
  updateChallenge,
  deleteChallenge,
} from '@/BL/challenges.service';
import { prismaMock } from '../../__mocks__/singleton';
import {
  mockChallengeWithId,
  mockChallengeWithQuestions,
  mockCreateChallengeData,
  mockUpdateChallengeData,
  mockChallengesResponse,
} from '../../__mocks__/custom/mockChallenge';
import { UpdateChallengeSchemaType } from '@/DTO/challenges.schema';

describe('Challenge Service', () => {
  // Create fresh instances in each test to avoid mutation issues
  const getMockChallenge = () => mockChallengeWithId();
  const getMockChallengeWithQuestions = () => mockChallengeWithQuestions();
  const getMockCreateData = () => mockCreateChallengeData();
  const getMockUpdateData = () => mockUpdateChallengeData();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createChallenge', () => {
    it('should create a new challenge successfully', async () => {
      const mockChallenge = getMockChallenge();
      const mockCreateData = getMockCreateData();
      
      prismaMock.challenges.create.mockResolvedValue(mockChallenge);

      const result = await createChallenge(mockCreateData);

      expect(prismaMock.challenges.create).toHaveBeenCalledWith({
        data: mockCreateData,
      });
      expect(result).toEqual(mockChallenge);
    });

    it('should handle errors when creating challenge fails', async () => {
      const mockCreateData = getMockCreateData();
      const error = new Error('Database error');
      prismaMock.challenges.create.mockRejectedValue(error);

      await expect(createChallenge(mockCreateData)).rejects.toThrow('Database error');
    });
  });

  describe('getChallenges', () => {
    it('should get all challenges with pagination successfully', async () => {
      const page = 1;
      const limit = 10;
      const mockResponseData = mockChallengesResponse(page, limit);

      prismaMock.challenges.findMany.mockResolvedValue(mockResponseData.challenges);
      prismaMock.challenges.count.mockResolvedValue(mockResponseData.totalChallenges);

      const result = await getChallenges(page, limit);

      expect(prismaMock.challenges.findMany).toHaveBeenCalledWith({
        skip: (page - 1) * limit,
        take: limit,
      });
      expect(prismaMock.challenges.count).toHaveBeenCalled();
      expect(result).toEqual(mockResponseData);
    });

    it('should handle empty challenges list', async () => {
      const page = 1;
      const limit = 10;

      prismaMock.challenges.findMany.mockResolvedValue([]);
      prismaMock.challenges.count.mockResolvedValue(0);

      const result = await getChallenges(page, limit);

      expect(result).toEqual({
        challenges: [],
        totalChallenges: 0,
        totalPages: 0,
        currentPage: page,
      });
    });

    it('should handle pagination correctly for multiple pages', async () => {
      const page = 2;
      const limit = 2;
      const mockResponseData = mockChallengesResponse(page, limit);

      prismaMock.challenges.findMany.mockResolvedValue(mockResponseData.challenges);
      prismaMock.challenges.count.mockResolvedValue(mockResponseData.totalChallenges);

      const result = await getChallenges(page, limit);

      expect(prismaMock.challenges.findMany).toHaveBeenCalledWith({
        skip: (page - 1) * limit,
        take: limit,
      });
      expect(result.totalPages).toBe(Math.ceil(mockResponseData.totalChallenges / limit));
      expect(result.currentPage).toBe(page);
    });
  });

  describe('getChallengeById', () => {
    it('should get challenge by ID with questions and answers successfully', async () => {
      const mockChallenge = getMockChallenge();
      const mockChallengeWithQuestionsData = getMockChallengeWithQuestions();
      
      prismaMock.challenges.findUnique.mockResolvedValue(mockChallengeWithQuestionsData);

      const result = await getChallengeById(mockChallenge.id);

      expect(prismaMock.challenges.findUnique).toHaveBeenCalledWith({
        where: { id: mockChallenge.id },
        include: {
          questions: {
            include: {
              answerText: true,
            },
          },
        },
      });
      expect(result).toEqual(mockChallengeWithQuestionsData);
    });

    it('should return null when challenge not found', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      prismaMock.challenges.findUnique.mockResolvedValue(null);

      const result = await getChallengeById(nonExistentId);

      expect(result).toBeNull();
    });

    it('should handle errors when getting challenge by ID fails', async () => {
      const mockChallenge = getMockChallenge();
      const error = new Error('Database error');
      prismaMock.challenges.findUnique.mockRejectedValue(error);

      await expect(getChallengeById(mockChallenge.id)).rejects.toThrow('Database error');
    });
  });

  describe('updateChallenge', () => {
    it('should update challenge successfully', async () => {
      const mockChallenge = getMockChallenge();
      const mockUpdateData = getMockUpdateData();
      const updatedChallenge = { ...mockChallenge, ...mockUpdateData };
      
      prismaMock.challenges.update.mockResolvedValue(updatedChallenge);

      const result = await updateChallenge(mockChallenge.id, mockUpdateData as UpdateChallengeSchemaType);

      expect(prismaMock.challenges.update).toHaveBeenCalledWith({
        where: { id: mockChallenge.id },
        data: mockUpdateData,
      });
      expect(result).toEqual(updatedChallenge);
    });

    it('should handle partial updates', async () => {
      const mockChallenge = getMockChallenge();
      const partialUpdate = { description: 'Only updating description' };
      const updatedChallenge = { ...mockChallenge, ...partialUpdate };
      
      prismaMock.challenges.update.mockResolvedValue(updatedChallenge);

      const result = await updateChallenge(mockChallenge.id, partialUpdate);

      expect(prismaMock.challenges.update).toHaveBeenCalledWith({
        where: { id: mockChallenge.id },
        data: partialUpdate,
      });
      expect(result.description).toBe(partialUpdate.description);
    });

    it('should handle errors when updating challenge fails', async () => {
      const mockChallenge = getMockChallenge();
      const mockUpdateData = getMockUpdateData();
      const error = new Error('Database error');
      prismaMock.challenges.update.mockRejectedValue(error);

      await expect(updateChallenge(mockChallenge.id, mockUpdateData as UpdateChallengeSchemaType))
        .rejects.toThrow('Database error');
    });
  });

  describe('deleteChallenge', () => {
    it('should delete challenge successfully', async () => {
      const mockChallenge = getMockChallenge();
      prismaMock.challenges.delete.mockResolvedValue(mockChallenge as any);

      await deleteChallenge(mockChallenge.id);

      expect(prismaMock.challenges.delete).toHaveBeenCalledWith({
        where: { id: mockChallenge.id },
      });
    });

    it('should handle errors when deleting challenge fails', async () => {
      const mockChallenge = getMockChallenge();
      const error = new Error('Database error');
      prismaMock.challenges.delete.mockRejectedValue(error);

      await expect(deleteChallenge(mockChallenge.id)).rejects.toThrow('Database error');
    });
  });
});