import express from 'express';
import registry from '@/lib/docs/openAPIRegistry';
import { CreateUserSchema, UserSchemaPublic } from '@/DTO/user.schema';
import { ResponseError } from '@/DTO/server.schema';
import { createUserHandler } from '../login.controller';

const router = express.Router();

registry.registerPath({
  method: 'post',
  path: '/api/login/create',
  summary: 'Create a new profile in the db',
  tags: ['login'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateUserSchema,
        },
      }
    }
  },
  responses: {
    201: {
      description: 'Challenge created successfully',
      content: {
        'application/json': {
          schema: UserSchemaPublic,
        },
      },
    },
    400: {
      description: 'Invalid input',
      content: {
        'application/json': {
          schema: ResponseError,
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: ResponseError,
        },
      },
    },
  },
});
router.post('/create', createUserHandler);

export default router;