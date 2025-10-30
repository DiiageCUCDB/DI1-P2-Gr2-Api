import { faker } from '@faker-js/faker';
import { challenges, questions, answers } from '../mockSchema';

export const mockChallengeWithId = () => {
  const challenge = challenges[0];
  // Add null check and provide default values
  if (!challenge) {
    return {
      id: faker.string.uuid(),
      name: faker.lorem.words(3),
      description: faker.lorem.sentences(2),
      difficulty: faker.number.int({ min: 1, max: 5 }),
      isGuildChallenge: faker.datatype.boolean(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return {
    id: challenge.id,
    name: challenge.name,
    description: challenge.description,
    difficulty: challenge.difficulty,
    isGuildChallenge: challenge.isGuildChallenge || false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export const mockChallengeWithQuestions = () => {
  const challenge = challenges[0];
  // Add null check and provide default values
  if (!challenge) {
    return {
      id: faker.string.uuid(),
      name: faker.lorem.words(3),
      description: faker.lorem.sentences(2),
      difficulty: faker.number.int({ min: 1, max: 5 }),
      isGuildChallenge: faker.datatype.boolean(),
      createdAt: new Date(),
      updatedAt: new Date(),
      questions: [],
    };
  }

  const challengeQuestions = questions.filter(q => q.challengeId === challenge.id);
  
  return {
    id: challenge.id,
    name: challenge.name,
    description: challenge.description,
    difficulty: challenge.difficulty,
    isGuildChallenge: challenge.isGuildChallenge || false,
    createdAt: new Date(),
    updatedAt: new Date(),
    questions: challengeQuestions.map(question => ({
      id: question.id,
      challengeId: question.challengeId,
      questionText: question.questionText,
      points: question.points,
      createdAt: new Date(),
      updatedAt: new Date(),
      answerText: answers.filter(a => a.questionId === question.id).map(answer => ({
        id: answer.id,
        questionId: answer.questionId,
        answer: answer.answer,
        isCorrect: answer.isCorrect,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    })),
  };
};

export const mockCreateChallengeData = () => {
  const challenge = challenges[0];
  // Add null check and provide default values
  if (!challenge) {
    return {
      name: faker.lorem.words(3),
      description: faker.lorem.sentences(2),
      difficulty: faker.number.int({ min: 1, max: 5 }),
      isGuildChallenge: faker.datatype.boolean(),
    };
  }

  return {
    name: challenge.name,
    description: challenge.description,
    difficulty: challenge.difficulty,
    isGuildChallenge: challenge.isGuildChallenge || false,
  };
};

export const mockUpdateChallengeData = () => ({
  name: faker.lorem.words(3),
  description: faker.lorem.sentences(2),
  difficulty: faker.number.int({ min: 1, max: 5 }),
});

export const mockChallengesResponse = (page: number, limit: number) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  // Ensure we have challenges to work with
  const challengesToUse = challenges.length > 0 
    ? challenges 
    : Array.from({ length: 5 }, () => ({
        id: faker.string.uuid(),
        name: faker.lorem.words(3),
        description: faker.lorem.sentences(2),
        difficulty: faker.number.int({ min: 1, max: 5 }),
        isGuildChallenge: faker.datatype.boolean(),
      }));

  const paginatedChallenges = challengesToUse.slice(startIndex, endIndex).map(challenge => ({
    id: challenge.id,
    name: challenge.name,
    description: challenge.description,
    difficulty: challenge.difficulty,
    isGuildChallenge: challenge.isGuildChallenge || false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  return {
    challenges: paginatedChallenges,
    totalChallenges: challengesToUse.length,
    totalPages: Math.ceil(challengesToUse.length / limit),
    currentPage: page,
  };
};