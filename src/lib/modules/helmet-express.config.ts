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
            'script-src': ['\'self\'', 'https://cdn.jsdelivr.net'],
          },
    },
  });
};
