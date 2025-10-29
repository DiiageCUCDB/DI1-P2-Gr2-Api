import { faker } from '@faker-js/faker';
import { answers } from '../mockSchema';

export const mockAnswerWithId = () => {
  const answer = answers[0];
  // Add null check and provide default values
  if (!answer) {
    return {
      id: faker.string.uuid(),
      questionId: faker.string.uuid(),
      answer: faker.lorem.word(),
      isCorrect: faker.datatype.boolean(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return {
    id: answer.id,
    questionId: answer.questionId,
    answer: answer.answer,
    isCorrect: answer.isCorrect,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};