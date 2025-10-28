import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';

// --- MOCK GUILDS ---
export const guilds = Array.from({ length: 3 }, () => ({
  id: uuidv4(),
  name: faker.company.name(),
  score: faker.number.int({ min: 0, max: 100 }),
}));

// --- MOCK USERS ---
export const users = Array.from({ length: 10 }, () => ({
  id: uuidv4(),
  username: faker.internet.username(),
  score: faker.number.int({ min: 0, max: 100 }),
  guildId: guilds[faker.number.int({ min: 0, max: guilds.length - 1 })].id,
}));

// --- MOCK CHALLENGES ---
export const challenges = Array.from({ length: 5 }, () => ({
  id: uuidv4(),
  name: faker.lorem.words(3),
  description: faker.lorem.sentences(2),
  difficulty: faker.number.int({ min: 1, max: 5 }),
  isGuildChallenge: faker.datatype.boolean(),
}));

// --- MOCK QUESTIONS ---
export const questions = Array.from({ length: 15 }, (_, i) => ({
  id: uuidv4(),
  challengeId: challenges[i % challenges.length].id,
  questionText: faker.lorem.sentence(),
  points: faker.number.int({ min: 1, max: 10 }),
}));

// --- MOCK ANSWERS ---
export const answers = Array.from({ length: 30 }, (_, i) => ({
  id: uuidv4(),
  questionId: questions[i % questions.length].id,
  answer: faker.lorem.word(),
  isCorrect: faker.datatype.boolean(),
}));

// --- MOCK RESPONSE USERS (UNIQUE) ---
export const responseUsers: { userId: string; answerId: string }[] = [];
const existing = new Set<string>();

while (responseUsers.length < 20) {
  const user = users[faker.number.int({ min: 0, max: users.length - 1 })];
  const answer = answers[faker.number.int({ min: 0, max: answers.length - 1 })];
  const key = `${user.id}-${answer.id}`;

  if (!existing.has(key)) {
    existing.add(key);
    responseUsers.push({ userId: user.id, answerId: answer.id });
  }
}
