import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import type { Logger } from 'winston';
import logger from './docs/logger';
import fs from 'fs';
import https from 'https';
import http from 'http';
import { httpsPort, url } from './config/env.config';
import { configureHelmet } from './modules/helmet-express.config';
import { configureRateLimit } from './modules/rate-limit-express.config';
import { configureCustomHeaders } from './modules/custom-headers-express.config';
import { configureErrorHandler } from './modules/error-handler-express.config';
import { configureResponseLogger } from './modules/response-logger-express.config';

declare global {
  // eslint-disable-next-line no-unused-vars
  namespace Express {
    // eslint-disable-next-line no-unused-vars
    interface Application {
      logger: Logger;
    }
    interface Response {
      json: () => Response;
    }
  }
}

const app = express();

app.set('trust proxy', process.env.NODE_ENV === 'production');

// Attach logger to app
app.logger = logger;

// Configure middleware
app.use(configureHelmet());
app.use(configureRateLimit());
// app.use(configureCors(app.logger));
app.use(configureCustomHeaders());
app.use(express.json());
app.use(configureResponseLogger(app.logger));
app.use(configureErrorHandler(app.logger));

let server: http.Server | null = null;

const startServer = (port?: number) => {
  const actualPort = port || httpsPort;
  if (server) {
    app.logger.warn('Server is already running');
    return server;
  }
  
  server = app.listen(actualPort, () => {
    app.logger.info(`Server is running on port ${url}:${actualPort}`);
  });
  
  return server;
};

const closeServer = () => {
  return new Promise<void>((resolve, reject) => {
    if (server) {
      server.close((err) => {
        if (err) {
          app.logger.error('Error closing server:', err);
          reject(err);
        } else {
          app.logger.info('Server closed successfully');
          server = null;
          resolve();
        }
      });
    } else {
      app.logger.info('Server instance not available, skipping close operation');
      resolve();
    }
  });
};

if (process.env.TLS_ENABLED === 'production') {
  const certsPath = process.env.TLS_FILE_PATH || './certs';
  // In production, you might want to start an HTTPS server
  const privateKey = fs.readFileSync(`${certsPath}/server.key`, 'utf8');
  const certificate = fs.readFileSync('${certsPath}/server.crt', 'utf8');
  const ca = fs.readFileSync('${certsPath}/ca.crt', 'utf8');

  const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca,
    honorCipherOrder: true,
    secureOptions: require('constants').SSL_OP_NO_TLSv1 | require('constants').SSL_OP_NO_TLSv1_1, // Disable TLS 1.0 & 1.1
    ciphers: [
      'ECDHE-ECDSA-AES256-GCM-SHA384',
      'ECDHE-RSA-AES256-GCM-SHA384',
      'ECDHE-ECDSA-AES128-GCM-SHA256',
      'ECDHE-RSA-AES128-GCM-SHA256'
    ].join(':'),
  };

  server = https.createServer(credentials, app).listen(httpsPort, () => {
    app.logger.info(`HTTPS Server is running on port ${url}:${httpsPort}`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app, startServer, closeServer, logger as appLogger };