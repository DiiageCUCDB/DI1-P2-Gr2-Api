import type { Request, Response, RequestHandler } from 'express';
import { createUser } from '@/BL/login.service';

// Handler to create a new user
export const createUserHandler: RequestHandler = async (
  request: Request,
  reply: Response
): Promise<void> => {
  try {
    const user = await createUser(request.body);
    reply.status(201).json(user);
  } catch (e) {
    console.error(e);
    reply.status(500).json({ error: 'Internal Server Error' });
  }
};