import express from 'express';
import registry from '@/lib/docs/openAPIRegistry';
import { ResponseError } from '@/DTO/server.schema';
import {
  downloadLatestHandler,
  getAllReleasesHandler
} from '../download.controller';

const router = express.Router();

// Register the path for getting latest release info
registry.registerPath({
  method: 'get',
  path: '/api/download/releases',
  summary: 'Get all releases with APK information',
  tags: ['Download'],
  responses: {
    200: {
      description: 'List of all releases',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              releases: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    tag_name: { type: 'string' },
                    name: { type: 'string' },
                    published_at: { type: 'string' },
                    apk_available: { type: 'boolean' },
                    apk_info: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        download_url: { type: 'string' },
                        size: { type: 'number' },
                        download_count: { type: 'number' }
                      }
                    }
                  }
                }
              }
            }
          },
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

registry.registerPath({
  method: 'get',
  path: '/api/download/latest',
  summary: 'Download the latest APK release',
  tags: ['Download'],
  responses: {
    302: {
      description: 'Redirect to the latest APK download URL',
    },
    404: {
      description: 'Latest APK release not found',
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

// Routes
router.get('/releases', getAllReleasesHandler);
router.get('/latest', downloadLatestHandler);

export default router;