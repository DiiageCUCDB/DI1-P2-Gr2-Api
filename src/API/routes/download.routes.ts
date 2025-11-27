import express from 'express';
import registry from '@/lib/docs/openAPIRegistry';
import { ResponseError } from '@/DTO/server.schema';
import {
  downloadLatestHandler,
  downloadVersionHandler,
  getLatestReleaseInfoHandler
} from '../download.controller';

const router = express.Router();

// Register the path for getting latest release info
registry.registerPath({
  method: 'get',
  path: '/api/download/info/latest',
  summary: 'Get information about the latest release',
  tags: ['Download'],
  responses: {
    200: {
      description: 'Latest release information',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              release: {
                type: 'object',
                properties: {
                  tag_name: { type: 'string' },
                  name: { type: 'string' },
                  apk_available: { type: 'boolean' },
                  apk_info: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      download_url: { type: 'string' },
                      size: { type: 'number' },
                      download_count: { type: 'number' }
                    }
                  },
                  all_assets: {
                    type: 'array',
                    items: {
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
    404: {
      description: 'No release found',
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

// Register the path for downloading latest APK
registry.registerPath({
  method: 'get',
  path: '/api/download/latest',
  summary: 'Download the latest APK from GitHub releases',
  tags: ['Download'],
  responses: {
    302: {
      description: 'Redirect to the latest APK download URL',
      headers: {
        Location: {
          schema: {
            type: 'string',
            description: 'URL to download the APK'
          }
        }
      }
    },
    404: {
      description: 'No APK found in latest release',
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

// Register the path for downloading specific version
registry.registerPath({
  method: 'get',
  path: '/api/download/{version}',
  summary: 'Download APK from specific version',
  tags: ['Download'],
  parameters: [
    {
      name: 'version',
      in: 'path',
      required: true,
      schema: {
        type: 'string',
        description: 'Version tag (e.g., v1.0.0, build-abc123)',
        example: 'v1.0.0',
      },
    },
  ],
  responses: {
    302: {
      description: 'Redirect to the specific version APK download URL',
      headers: {
        Location: {
          schema: {
            type: 'string',
            description: 'URL to download the APK'
          }
        }
      }
    },
    404: {
      description: 'Version not found or no APK in release',
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
router.get('/info/latest', getLatestReleaseInfoHandler);
router.get('/latest', downloadLatestHandler);
router.get('/:version', downloadVersionHandler);

export default router;