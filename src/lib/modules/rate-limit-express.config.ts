import rateLimit from 'express-rate-limit';
import { rememberIpMinutes, numberRequestPerIp } from '@/lib/config/env.config';

export const configureRateLimit = () => {
  return rateLimit({
    windowMs: rememberIpMinutes * 60 * 1000,
    max: numberRequestPerIp,
    message: {
      isSuccess: false,
      message: 'Too many requests, please try again later.'
    }
  });
};
