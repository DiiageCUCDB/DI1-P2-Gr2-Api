import express from 'express';
import {
  createResponseHandler,
  validateCreateResponse,
} from '../responses.controller';
import registry from '@/lib/docs/openAPIRegistry';
import { ResponseError } from '@/DTO/server.schema';
import {
  ResponseResultServer,
} from '@/DTO/responses.schema';

const router = express.Router();

// Register the path for creating a new response
registry.registerPath({
  method: 'post',
  path: '/api/responses',
  summary: 'Create a new response and update scores',
  tags: ['Responses'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: ResponseResultServer,
        },
      }
    }
  },
  responses: {
    204: {
      description: 'Response created successfully and scores updated',
    },
    404: {
      description: 'User or answer not found',
      content: {
        'application/json': {
          schema: ResponseError,
        },
      },
    },
    409: {
      description: 'Response already exists',
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
router.post('/', validateCreateResponse, createResponseHandler);

export default router;