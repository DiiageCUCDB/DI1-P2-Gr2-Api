import type { Request, Response, NextFunction } from 'express';
import type { Logger } from 'winston';

export const configureResponseLogger = (logger: Logger) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime();
    const requestId = logger.routeStart(req);

    const originalJson = res.json.bind(res);

    res.json = function (this: Response, payload: any): Response {
      if (typeof payload === 'object' && payload !== null && payload.openapi) {
        return originalJson(payload);
      }

      const end = process.hrtime();
      const durationInMs = (end[0] * 1e9 + end[1] - (start[0] * 1e9 + start[1])) / 1e6;

      const { isSuccess = true, message = 'Success', error, override = false, ...data } = payload;

      let responsePayload;

      if (Array.isArray(payload)) {
        payload = { results: payload };
      } else if (typeof payload === 'object' && payload !== null) {
        payload = { result: payload };
      }

      if (override) {
        responsePayload = data;
      } else if (isSuccess) {
        responsePayload = {
          ...payload,
          generationTime_ms: durationInMs,
          success: true,
          message: message,
        };
      } else {
        responsePayload = {
          success: false,
          message: message,
          error: error,
          generationTime_ms: durationInMs,
        };
      }

      return originalJson(responsePayload);
    };

    res.on('finish', () => {
      const end = process.hrtime();
      const durationInMs = (end[0] * 1e9 + end[1] - (start[0] * 1e9 + start[1])) / 1e6;
      logger.routeEnd(req, res, requestId, durationInMs);
    });

    next();
  };
};