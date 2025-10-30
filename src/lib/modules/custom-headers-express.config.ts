import type { Request, Response, NextFunction } from 'express';
import { packageJson } from '@/lib/config/env.config';

export const configureCustomHeaders = () => {
  return (_req: Request, res: Response, next: NextFunction) => {
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');
    res.setHeader('apiName', packageJson.name);
    res.setHeader('apiVersion', packageJson.version);
    next();
  };
};