import prisma from '@/DAL/prismaClient';
import {
  type CreateQuestionSchemaType,
  type UpdateQuestionSchemaType,
} from '../DTO/questions.schema';

// Create a new question with answers
export async function createQuestion(input: CreateQuestionSchemaType) {
  const { answers, ...questionData } = input;

  const question = await prisma.$transaction(async (tx) => {
    // Create the question
    const newQuestion = await tx.questions.create({
      data: questionData,
    });

    // Create all answers for this question
    const answersArray = await Promise.all(
      answers.map((answer) =>
        tx.answer.create({
          data: {
            ...answer,
            questionId: newQuestion.id,
          },
        })
      )
    );

    return {
      ...newQuestion,
      answers: answersArray,
    };
  });

  return question;
}

// Update a question and its answers
export async function updateQuestion(id: string, input: UpdateQuestionSchemaType) {
  const { answers, ...questionData } = input;

  const question = await prisma.$transaction(async (tx) => {
    // Update the question
    const updatedQuestion = await tx.questions.update({
      where: { id },
      data: questionData,
    });

    // If answers are provided, update them
    if (answers) {
      // Delete existing answers
      await tx.answer.deleteMany({
        where: { questionId: id },
      });

      // Create new answers
      const answersArray = await Promise.all(
        answers.map((answer) =>
          tx.answer.create({
            data: {
              ...answer,
              questionId: id,
            },
          })
        )
      );

      return {
        ...updatedQuestion,
        answers: answersArray,
      };
    }

    return updatedQuestion;
  });

  return question;
}

// Delete a question and its answers
export async function deleteQuestion(id: string) {
  await prisma.$transaction(async (tx) => {
    // Delete all answers for this question first (due to foreign key constraints)
    await tx.answer.deleteMany({
      where: { questionId: id },
    });

    // Delete the question
    await tx.questions.delete({
      where: { id },
    });
  });
}
