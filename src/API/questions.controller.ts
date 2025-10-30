import type { Request, Response, RequestHandler } from 'express';
import { app } from '@/lib/express';
import {
  CreateQuestionSchema,
  UpdateQuestionSchema,
  QuestionIdSchema,
} from '@/DTO/questions.schema';
import {
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from '@/BL/questions.service';
import { validateRequest } from '@/lib/modules/zod-validator-express.config';

// Middleware validators for question routes
export const validateCreateQuestion = validateRequest('body', CreateQuestionSchema, app.logger);
export const validateUpdateQuestion = validateRequest('body', UpdateQuestionSchema, app.logger);
export const validateQuestionId = validateRequest('params', QuestionIdSchema, app.logger);

// Handler to create a new question with answers
export const createQuestionHandler: RequestHandler = async (
  request: Request,
  reply: Response
): Promise<void> => {
  try {
    const question = await createQuestion(request.body);
    reply.status(201).json(question);
  } catch (e) {
    console.error(e);
    if (e instanceof Error && e.message.includes('Foreign key constraint failed')) {
      reply.status(400).json({ error: 'Invalid challenge ID' });
    } else {
      reply.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

// Handler to update a question and its answers
export const updateQuestionHandler: RequestHandler<{ id: string }> = async (
  request: Request<{ id: string }>,
  reply: Response
): Promise<void> => {
  try {
    const updatedQuestion = await updateQuestion(request.params.id, request.body);
    reply.json(updatedQuestion);
  } catch (e) {
    console.error(e);
    if (e instanceof Error && e.message.includes('Record to update not found')) {
      reply.status(404).json({ error: 'Question not found' });
    } else if (e instanceof Error && e.message.includes('Foreign key constraint failed')) {
      reply.status(400).json({ error: 'Invalid challenge ID' });
    } else {
      reply.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

// Handler to delete a question and its answers
export const deleteQuestionHandler: RequestHandler<{ id: string }> = async (
  request: Request<{ id: string }>,
  reply: Response
): Promise<void> => {
  try {
    await deleteQuestion(request.params.id);
    reply.status(204).send();
  } catch (e) {
    console.error(e);
    if (e instanceof Error && e.message.includes('Record to delete does not exist')) {
      reply.status(404).json({ error: 'Question not found' });
    } else {
      reply.status(500).json({ error: 'Internal Server Error' });
    }
  }
};