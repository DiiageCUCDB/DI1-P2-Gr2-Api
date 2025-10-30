import { auth } from 'express-oauth2-jwt-bearer';
import type { Request, Response, NextFunction } from 'express';
import {  app } from '@/lib/express';

// Configure OAuth2 JWT validation
const authenticateOAuth2 = auth({
  issuerBaseURL: 'https://YOUR_DOMAIN/',
  audience: 'YOUR_API_AUDIENCE',
});

// Optionally handle errors cleanly
const handleAuthErrors = (err: any, _req: Request, res: Response, next: NextFunction): void => {
  if (err.name === 'UnauthorizedError') {
    app.logger.warn(`Unauthorized access attempt: ${err.message}`);
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next(err);
};

export { authenticateOAuth2, handleAuthErrors };
