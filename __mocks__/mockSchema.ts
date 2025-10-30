import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';

// --- MOCK GUILDS ---
export const guilds = Array.from({ length: 3 }, () => ({
  id: uuidv4(),
  name: faker.company.name(),
  score: faker.number.int({ min: 0, max: 100 }),
}));

// --- MOCK USERS ---
export const users = Array.from({ length: 10 }, () => {
  // Ensure we get a valid guild index
  const guildIndex = faker.number.int({ min: 0, max: guilds.length - 1 });
  const guild = guilds[guildIndex]!;
  
  return {
    id: uuidv4(),
    username: faker.internet.username(),
    score: faker.number.int({ min: 0, max: 100 }),
    guildId: guild.id, // guild is guaranteed to exist
  };
});

// --- MOCK CHALLENGES ---
export const challenges = Array.from({ length: 5 }, () => ({
  id: uuidv4(),
  name: faker.lorem.words(3),
  description: faker.lorem.sentences(2),
  difficulty: faker.number.int({ min: 1, max: 5 }),
  isGuildChallenge: faker.datatype.boolean(),
}));

// --- MOCK QUESTIONS ---
export const questions = Array.from({ length: 15 }, (_, i) => {
  // Ensure we get a valid challenge index using modulo
  const challengeIndex = i % challenges.length;
  const challenge = challenges[challengeIndex]!;
  
  return {
    id: uuidv4(),
    challengeId: challenge.id, // challenge is guaranteed to exist
    questionText: faker.lorem.sentence(),
    points: faker.number.int({ min: 1, max: 10 }),
  };
});

// --- MOCK ANSWERS ---
export const answers = Array.from({ length: 30 }, (_, i) => {
  // Ensure we get a valid question index using modulo
  const questionIndex = i % questions.length;
  const question = questions[questionIndex]!;
  
  return {
    id: uuidv4(),
    questionId: question.id, // question is guaranteed to exist
    answer: faker.lorem.word(),
    isCorrect: faker.datatype.boolean(),
  };
});

// --- MOCK RESPONSE USERS (UNIQUE) ---
export const responseUsers: { userId: string; answerId: string }[] = [];
const existing = new Set<string>();

while (responseUsers.length < 20) {
  // Ensure we get valid indices
  const userIndex = faker.number.int({ min: 0, max: users.length - 1 });
  const answerIndex = faker.number.int({ min: 0, max: answers.length - 1 });
  
  const user = users[userIndex]!;
  const answer = answers[answerIndex]!;
  
  // Both user and answer are guaranteed to exist due to the index range
  const key = `${user.id}-${answer.id}`;

  if (!existing.has(key)) {
    existing.add(key);
    responseUsers.push({
      userId: user.id,
      answerId: answer.id
    });
  }
}