import type { Request, Response, RequestHandler } from 'express';
import { app } from '@/lib/express';
import {
  CreateChallengeSchema,
  UpdateChallengeSchema,
  ChallengeIdSchema,
} from '@/DTO/challenges.schema';
import {
  createChallenge,
  getChallenges,
  getChallengeById,
  updateChallenge,
  deleteChallenge,
} from '@/BL/challenges.service';
import { validateRequest } from '@/lib/modules/zod-validator-express.config';

// Middleware validators for challenge routes
export const validateCreateChallenge = validateRequest('body', CreateChallengeSchema, app.logger);
export const validateUpdateChallenge = validateRequest('body', UpdateChallengeSchema, app.logger);
export const validateChallengeId = validateRequest('params', ChallengeIdSchema, app.logger);

// Handler to create a new challenge
export const createChallengeHandler: RequestHandler = async (
  request: Request,
  reply: Response
): Promise<void> => {
  try {
    const challenge = await createChallenge(request.body);
    reply.status(201).json(challenge);
  } catch (e) {
    console.error(e);
    reply.status(500).json({ error: 'Internal Server Error' });
  }
};

// Handler to get all challenges with pagination
export const getChallengesHandler: RequestHandler = async (
  request: Request,
  reply: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = request.query;
    const challenges = await getChallenges(Number(page), Number(limit));
    reply.json(challenges);
  } catch (e) {
    console.error(e);
    reply.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getChallengeByIdHandler: RequestHandler<{ id: string }> = async (
  request: Request<{ id: string }>,
  reply: Response
): Promise<void> => {
  try {
    const challenge = await getChallengeById(request.params.id);
    if (challenge) {
      reply.json(challenge);
    } else {
      reply.status(404).json({ error: 'Challenge not found' });
    }
  } catch (e) {
    console.error(e);
    reply.status(500).json({ error: 'Internal Server Error' });
  }
};

// Handler to update a challenge
export const updateChallengeHandler: RequestHandler<{ id: string }> = async (
  request: Request<{ id: string }>,
  reply: Response
): Promise<void> => {
  try {
    const updatedChallenge = await updateChallenge(request.params.id, request.body);
    reply.json(updatedChallenge);
  } catch (e) {
    console.error(e);
    if (e instanceof Error && e.message.includes('Record to update not found')) {
      reply.status(404).json({ error: 'Challenge not found' });
    } else {
      reply.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

// Handler to delete a challenge
export const deleteChallengeHandler: RequestHandler<{ id: string }> = async (
  request: Request<{ id: string }>,
  reply: Response
): Promise<void> => {
  try {
    await deleteChallenge(request.params.id);
    reply.status(204).send();
  } catch (e) {
    console.error(e);
    if (e instanceof Error && e.message.includes('Record to delete does not exist')) {
      reply.status(404).json({ error: 'Challenge not found' });
    } else {
      reply.status(500).json({ error: 'Internal Server Error' });
    }
  }
};