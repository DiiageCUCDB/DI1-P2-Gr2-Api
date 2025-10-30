import express from 'express';
import {
  createChallengeHandler,
  getChallengesHandler,
  getChallengeByIdHandler,
  updateChallengeHandler,
  deleteChallengeHandler,
} from '../challenges.controller';
import {
  validateCreateChallenge,
  validateUpdateChallenge,
  validateChallengeId
} from '../challenges.controller';
import registry from '@/lib/docs/openAPIRegistry';
import { ResponseError } from '@/DTO/server.schema';
import { ChallengeResultServer, GetChallengesResponseResultServer, CreateChallengeSchema, UpdateChallengeSchema } from '@/DTO/challenges.schema';

const router = express.Router();

// Register the path for creating a new challenge
registry.registerPath({
  method: 'post',
  path: '/api/challenges',
  summary: 'Create a new challenge',
  tags: ['Challenges'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateChallengeSchema,
        },
      }
    }
  },
  responses: {
    201: {
      description: 'Challenge created successfully',
      content: {
        'application/json': {
          schema: ChallengeResultServer,
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
router.post('/', validateCreateChallenge, createChallengeHandler);

// Register the path for getting all challenges with pagination
registry.registerPath({
  method: 'get',
  path: '/api/challenges',
  summary: 'Get all challenges',
  tags: ['Challenges'],
  parameters: [
    {
      name: 'page',
      in: 'query',
      required: false,
      schema: {
        type: 'integer',
        description: 'Page number for pagination',
        example: 1,
      },
    },
    {
      name: 'limit',
      in: 'query',
      required: false,
      schema: {
        type: 'integer',
        description: 'Number of challenges per page',
        example: 10,
      },
    },
  ],
  responses: {
    200: {
      description: 'List of challenges',
      content: {
        'application/json': {
          schema: GetChallengesResponseResultServer,
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
router.get('/', getChallengesHandler);

// Register the path for getting a challenge by ID
registry.registerPath({
  method: 'get',
  path: '/api/challenges/{id}',
  summary: 'Get challenge by ID',
  tags: ['Challenges'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: {
        type: 'string',
        format: 'uuid',
        description: 'ID of the challenge to retrieve',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
    },
  ],
  responses: {
    200: {
      description: 'Challenge found',
      content: {
        'application/json': {
          schema: ChallengeResultServer,
        },
      },
    },
    404: {
      description: 'Challenge not found',
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
router.get('/:id', validateChallengeId, getChallengeByIdHandler);

// Register the path for updating a challenge
registry.registerPath({
  method: 'put',
  path: '/api/challenges/{id}',
  summary: 'Update a challenge',
  tags: ['Challenges'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: {
        type: 'string',
        format: 'uuid',
        description: 'ID of the challenge to update',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
    },
  ],
  request: {
    body: {
      content: {
        'application/json': {
          schema: UpdateChallengeSchema,
        },
      }
    }
  },
  responses: {
    200: {
      description: 'Challenge updated successfully',
      content: {
        'application/json': {
          schema: ChallengeResultServer,
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
    404: {
      description: 'Challenge not found',
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
router.put('/:id', validateChallengeId, validateUpdateChallenge, updateChallengeHandler);

// Register the path for deleting a challenge
registry.registerPath({
  method: 'delete',
  path: '/api/challenges/{id}',
  summary: 'Delete a challenge',
  tags: ['Challenges'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: {
        type: 'string',
        format: 'uuid',
        description: 'ID of the challenge to delete',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
    },
  ],
  responses: {
    204: {
      description: 'Challenge deleted successfully',
    },
    404: {
      description: 'Challenge not found',
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
router.delete('/:id', validateChallengeId, deleteChallengeHandler);

export default router;