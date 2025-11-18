import prisma from '@/DAL/prismaClient';
import { type ResponseSchemaType } from '../DTO/responses.schema';

// Create a new response and update scores
export async function createResponse(input: ResponseSchemaType) {
  const { userId, answerId } = input;

  await prisma.$transaction(async (tx) => {
    // 1. Check if user exists
    const user = await tx.users.findUnique({
      where: { id: userId },
      include: {
        guild: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // 2. Get answer details with question and challenge information
    const answer = await tx.answer.findUnique({
      where: { id: answerId },
      include: {
        question: {
          include: {
            challenge: true,
          },
        },
      },
    });

    if (!answer) {
      throw new Error('Answer not found');
    }

    // 3. Check if response already exists (unique constraint)
    const existingResponse = await tx.responseUser.findUnique({
      where: {
        userId_answerId: {
          userId,
          answerId,
        },
      },
    });

    if (existingResponse) {
      throw new Error('Response already exists');
    }

    // 4. Create the response record
    await tx.responseUser.create({
      data: {
        userId,
        answerId,
      },
    });

    // 5. Update scores if answer is correct
    if (answer.isCorrect) {
      const points = answer.question.points;

      // Update user score
      await tx.users.update({
        where: { id: userId },
        data: {
          score: {
            increment: points,
          },
        },
      });

      // Update guild score if it's a guild challenge
      if (answer.question.challenge.isGuildChallenge && user.guildId) {
        await tx.guilds.update({
          where: { id: user.guildId },
          data: {
            score: {
              increment: points,
            },
          },
        });
      }
    }
  });

  // No return value - just complete the transaction successfully
}