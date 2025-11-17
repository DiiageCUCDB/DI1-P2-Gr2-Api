import type { Request, Response, RequestHandler } from 'express';
import { app } from '@/lib/express';
import {
  ResponseSchema,
} from '@/DTO/responses.schema';
import {
  createResponse,
} from '@/BL/responses.service';
import { validateRequest } from '@/lib/modules/zod-validator-express.config';

// Middleware validators for response routes
export const validateCreateResponse = validateRequest('body', ResponseSchema, app.logger);

// Handler to create a new response
export const createResponseHandler: RequestHandler = async (
  request: Request,
  reply: Response
): Promise<void> => {
  try {
    await createResponse(request.body);
    // Return 204 No Content with no body
    reply.status(204).send();
  } catch (e) {
    app.logger.logWithErrorHandling('Error creating response', e);
    if (e instanceof Error) {
      if (e.message.includes('User not found')) {
        reply.status(404).json({ error: e.message });
      } else if (e.message.includes('Answer not found')) {
        reply.status(404).json({ error: e.message });
      } else if (e.message.includes('Response already exists')) {
        reply.status(409).json({ error: e.message });
      } else {
        reply.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      reply.status(500).json({ error: 'Internal Server Error' });
    }
  }
};