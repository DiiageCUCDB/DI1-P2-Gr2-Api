import express from 'express';
import {
  healthController,
  healthCheckValidator
} from '@/API/server.controller';
import registry from '@/lib/docs/openAPIRegistry';
import { ResponseError } from '@/DTO/server.schema';
import {
  ResponseWithHealthCheck
} from '@/DTO/server.schema';
import { apiReference } from '@scalar/express-api-reference';
import { docs } from '@/lib/docs/docOpenApi';

const router = express.Router();

// Register OpenAPI paths
registry.registerPath({
    method: 'get',
    path: '/api/health',
    summary: 'Health check endpoint',
    tags: ['Server'],
    responses: {
      200: {
        description: 'Server is running',
        content: {
          'application/json': {
            schema: ResponseWithHealthCheck,
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
  
// Apply the Zod validation middleware before the controller
router.get('/health', healthCheckValidator, healthController);

if (process.env.DOC_ENABLE === 'true') {
  registry.registerPath({
    method: 'get',
    path: '/api/docs',
    summary: 'API documentation',
    tags: ['Server'],
    responses: {
      200: {
        description: 'API documentation',
      },
    },
  });

  // Swagger documentation route
  router.use(
      '/docs',
      apiReference({ spec: { content: docs } }),
  );

  registry.registerPath({
    method: 'get',
    path: '/api/openapi.json',
    summary: 'OpenAPI JSON documentation',
    tags: ['Server'],
    responses: {
      200: {
        description: 'OpenAPI JSON documentation',
      },
    },
  });

  // OpenAPI JSON route
  router.get('/openapi.json', (_req, res) => {
    const openApiDocument = docs();
    res.json(openApiDocument);
  });
}

export default router;