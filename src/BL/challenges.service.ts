import prisma from '@/DAL/prismaClient';
import {
  type CreateChallengeSchemaType,
  type UpdateChallengeSchemaType,
} from '../DTO/challenges.schema';

// Create a new challenge
export async function createChallenge(input: CreateChallengeSchemaType) {
  const challenge = await prisma.challenges.create({
    data: input,
  });
  return challenge;
}

// Get all challenges with pagination
export async function getChallenges(page: number, limit: number) {
  const challenges = await prisma.challenges.findMany({
    skip: (page - 1) * limit,
    take: limit,
  });
  const totalChallenges = await prisma.challenges.count();
  return {
    challenges,
    totalChallenges,
    totalPages: Math.ceil(totalChallenges / limit),
    currentPage: page,
  };
}

// Get a challenge by ID
export async function getChallengeById(id: string) {
  const challenge = await prisma.challenges.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      difficulty: true,
      isGuildChallenge: true,
      questions: {
        select: {
          id: true,
          challengeId: true,
          questionText: true,
          // Include answers but exclude `isCorrect`, `createdAt`, `updatedAt`
          answers: {
            select: {
              id: true,
              questionId: true,
              answer: true,
            },
          },
        },
      },
    },
  });

  return challenge;
}


// Update a challenge
export async function updateChallenge(id: string, input: UpdateChallengeSchemaType) {
  const challenge = await prisma.challenges.update({
    where: { id },
    data: input,
  });
  return challenge;
}

// Delete a challenge
export async function deleteChallenge(id: string) {
  await prisma.challenges.delete({
    where: { id },
  });
}