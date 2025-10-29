import { faker } from '@faker-js/faker';
import { questions, answers } from '../mockSchema';

export const mockQuestionWithId = () => {
  const question = questions[0];
  // Add null check and provide default values
  if (!question) {
    return {
      id: faker.string.uuid(),
      challengeId: faker.string.uuid(),
      questionText: faker.lorem.sentence(),
      points: faker.number.int({ min: 1, max: 10 }),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return {
    id: question.id,
    challengeId: question.challengeId,
    questionText: question.questionText,
    points: question.points,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export const mockQuestionWithAnswers = () => {
  const question = questions[0];
  // Add null check and provide default values
  if (!question) {
    return {
      id: faker.string.uuid(),
      challengeId: faker.string.uuid(),
      questionText: faker.lorem.sentence(),
      points: faker.number.int({ min: 1, max: 10 }),
      createdAt: new Date(),
      updatedAt: new Date(),
      answerText: [],
    };
  }

  const questionAnswers = answers.filter(a => a.questionId === question.id);
  
  return {
    id: question.id,
    challengeId: question.challengeId,
    questionText: question.questionText,
    points: question.points,
    createdAt: new Date(),
    updatedAt: new Date(),
    answerText: questionAnswers.map(answer => ({
      id: answer.id,
      questionId: answer.questionId,
      answer: answer.answer,
      isCorrect: answer.isCorrect,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  };
};

export const mockCreateQuestionData = () => {
  const question = questions[0];
  const questionAnswers = answers.filter(a => a && question && a.questionId === question.id);
  
  // Add null check and provide default values
  if (!question || questionAnswers.length === 0) {
    return {
      challengeId: faker.string.uuid(),
      questionText: faker.lorem.sentence(),
      answerText: [
        {
          answer: faker.lorem.word(),
          isCorrect: true,
        },
        {
          answer: faker.lorem.word(),
          isCorrect: false,
        },
      ],
    };
  }

  return {
    challengeId: question.challengeId,
    questionText: question.questionText,
    answerText: questionAnswers.map(answer => ({
      answer: answer.answer,
      isCorrect: answer.isCorrect,
    })),
  };
};

export const mockUpdateQuestionData = () => ({
  questionText: faker.lorem.sentence(),
  answerText: [
    {
      answer: faker.lorem.word(),
      isCorrect: true,
    },
    {
      answer: faker.lorem.word(),
      isCorrect: false,
    },
  ],
});