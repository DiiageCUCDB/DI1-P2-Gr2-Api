import cors from 'cors';
import { nodeEnv, allowedOrigins } from '@/lib/config/env.config';
import type { Logger } from 'winston';

export const configureCors = (logger: Logger) => {
  logger.debug(`NODE_ENV raw: [${nodeEnv}]`);
  logger.debug(`CORS allowed origins: ${allowedOrigins.join(', ')}`);

  return cors({
    origin: (origin, callback) => {
      if (!origin) {
        if (nodeEnv === 'development') {
          logger.info('CORS allowed (no origin in development)');
          return callback(null, true);
        } else {
          logger.warn('CORS blocked: no origin (not in development)');
          return callback(new Error('Not allowed by CORS'));
        }
      }

      if (!allowedOrigins.includes(origin)) {
        logger.warn(`CORS blocked: ${origin}`);
        return callback(new Error('Not allowed by CORS'));
      }

      callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204,
  });
};
