import type { Request, Response, RequestHandler } from 'express';
import { app } from '@/lib/express';
import { packageJson, nodeEnv } from '@/lib/config/env.config';
import { HealthCheck } from '@/DTO/server.schema';
import { validateResponse } from '@/lib/modules/zod-validator-express.config';

// Middleware to validate the health check response using Zod
export const healthCheckValidator = validateResponse(HealthCheck, app.logger);

export const healthController: RequestHandler = async (
    _request: Request,
    reply: Response
  ): Promise<void> => {
    try {
        app.logger.info('Health check endpoint called'); // Log the health check call

        const result = {
            status: 'OK',
            uptime: `${process.uptime()} seconds`,
            message: 'Server is running',
            timestamp: new Date().toISOString(),
            version: packageJson.version, // Get the version from package.json
            environment: nodeEnv, // Get the environment from environment variables
            unix: new Date().getTime()
        };

        // Response validation is now handled by the middleware
        reply.status(200).json(result); // Send the health check response
    } catch (e) {
        app.logger.logWithErrorHandling('Error in health check endpoint:', e); // Log unexpected errors
        reply.status(500).send({ error: 'Internal Server Error' }); // Send generic error response
    }
  };