import prisma from '@/DAL/prismaClient';
import type { RequestSchemaType, ResponseSchemaType } from '../DTO/responses.schema';

// Create multiple responses and update scores
export async function createResponse(input: RequestSchemaType): Promise<ResponseSchemaType> {
  const { userId, answerId: answerIds } = input;

  const result = await prisma.$transaction(async (tx) => {
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

    // 2. Get all answer details with question and challenge information
    const answers = await tx.answer.findMany({
      where: {
        id: { in: answerIds }
      },
      include: {
        question: {
          include: {
            challenge: {
              include: {
                questions: {
                  include: {
                    answers: true
                  }
                }
              }
            },
          },
        },
      },
    });

    if (answers.length !== answerIds.length) {
      throw new Error('One or more answers not found');
    }

    // 3. Check for existing responses
    const existingResponses = await tx.responseUser.findMany({
      where: {
        userId,
        answerId: { in: answerIds },
      },
    });

    if (existingResponses.length > 0) {
      throw new Error('One or more responses already exist');
    }

    // 4. Create all response records first
    await tx.responseUser.createMany({
      data: answerIds.map(answerId => ({
        userId,
        answerId,
      })),
    });

    // 5. Get all challenges that the user has interacted with (including the new ones)
    const userChallenges = await tx.challenges.findMany({
      where: {
        questions: {
          some: {
            answers: {
              some: {
                ResponseUser: {
                  some: {
                    userId: userId
                  }
                }
              }
            }
          }
        }
      },
      include: {
        questions: {
          include: {
            answers: {
              include: {
                ResponseUser: {
                  where: {
                    userId: userId
                  }
                }
              }
            }
          }
        }
      }
    });

    let totalScore = 0;
    let guildScore = 0;

    // 6. Check which challenges are completed
    for (const challenge of userChallenges) {
      let isChallengeCompleted = true;

      for (const question of challenge.questions) {
        const correctAnswers = question.answers.filter(a => a.isCorrect);
        const userAnswers = question.answers.filter(a =>
          a.ResponseUser.length > 0
        );

        // User must have answered all correct answers and no incorrect ones
        const userGotAllCorrect = correctAnswers.every(correctAnswer =>
          userAnswers.some(userAnswer => userAnswer.id === correctAnswer.id)
        ) && userAnswers.every(userAnswer => userAnswer.isCorrect);

        if (!userGotAllCorrect) {
          isChallengeCompleted = false;
          break;
        }
      }

      if (isChallengeCompleted) {
        const challengePoints = challenge.questions.reduce((sum, question) => sum + question.points, 0);
        totalScore += challengePoints;
        
        if (challenge.isGuildChallenge && user.guildId) {
          guildScore += challengePoints;
        }
      }
    }

    // 7. Update user score
    if (totalScore > 0) {
      await tx.users.update({
        where: { id: userId },
        data: {
          score: {
            increment: totalScore,
          },
        },
      });
    }

    // 8. Update guild score for guild challenges
    if (guildScore > 0 && user.guildId) {
      await tx.guilds.update({
        where: { id: user.guildId },
        data: {
          score: {
            increment: guildScore,
          },
        },
      });
    }

    return totalScore;
  });

  // Return the score in the expected format
  return { score: result };
}