import type { ErrorRequestHandler } from 'express';
import type { Logger } from 'winston';

export const configureErrorHandler = (logger: Logger): ErrorRequestHandler => {
  return (error, _req, res, _next) => {
    logger.logWithErrorHandling(error.message, error);
    res.status(500).json({
      isSuccess: false,
      message: 'Internal server error',
      error: error.message
    });
  };
};