import express from 'express';
import {
  createQuestionHandler,
  updateQuestionHandler,
  deleteQuestionHandler,
  validateCreateQuestion,
  validateUpdateQuestion,
  validateQuestionId,
} from '../questions.controller';
import registry from '@/lib/docs/openAPIRegistry';
import { ResponseError } from '@/DTO/server.schema';
import {
  QuestionResultServer,
  CreateQuestionSchema,
  UpdateQuestionSchema,
} from '@/DTO/questions.schema';

const router = express.Router();

// Register the path for creating a new question with answers
registry.registerPath({
  method: 'post',
  path: '/api/questions',
  summary: 'Create a new question with answers',
  tags: ['Questions'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateQuestionSchema,
        },
      }
    }
  },
  responses: {
    201: {
      description: 'Question created successfully',
      content: {
        'application/json': {
          schema: QuestionResultServer,
        },
      },
    },
    400: {
      description: 'Invalid input or invalid challenge ID',
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
router.post('/', validateCreateQuestion, createQuestionHandler);

// Register the path for updating a question and its answers
registry.registerPath({
  method: 'put',
  path: '/api/questions/{id}',
  summary: 'Update a question and its answers',
  tags: ['Questions'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: {
        type: 'string',
        format: 'uuid',
        description: 'ID of the question to update',
        example: '770e8400-e29b-41d4-a716-446655440000',
      },
    },
  ],
  request: {
    body: {
      content: {
        'application/json': {
          schema: UpdateQuestionSchema,
        },
      }
    }
  },
  responses: {
    200: {
      description: 'Question updated successfully',
      content: {
        'application/json': {
          schema: QuestionResultServer,
        },
      },
    },
    400: {
      description: 'Invalid input or invalid challenge ID',
      content: {
        'application/json': {
          schema: ResponseError,
        },
      },
    },
    404: {
      description: 'Question not found',
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
router.put('/:id', validateQuestionId, validateUpdateQuestion, updateQuestionHandler);

// Register the path for deleting a question and its answers
registry.registerPath({
  method: 'delete',
  path: '/api/questions/{id}',
  summary: 'Delete a question and its answers',
  tags: ['Questions'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: {
        type: 'string',
        format: 'uuid',
        description: 'ID of the question to delete',
        example: '770e8400-e29b-41d4-a716-446655440000',
      },
    },
  ],
  responses: {
    204: {
      description: 'Question deleted successfully',
    },
    404: {
      description: 'Question not found',
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
router.delete('/:id', validateQuestionId, deleteQuestionHandler);

export default router;