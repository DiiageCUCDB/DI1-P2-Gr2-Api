import helmet from 'helmet';
import { nodeEnv } from '@/lib/config/env.config';

export const configureHelmet = () => {
  const isProd = nodeEnv === 'production';

  return helmet({
    contentSecurityPolicy: {
      directives: isProd
        ? {
            'default-src': ['\'none\''],
          }
        : {
            'default-src': ['\'self\'', 'https://cdn.jsdelivr.net', '\'unsafe-eval\''],
            'script-src': ['\'self\'', 'https://cdn.jsdelivr.net', '\'unsafe-eval\''],
          },
    },
  });
};