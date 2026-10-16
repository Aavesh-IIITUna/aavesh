import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createApiRouter } from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { env } from './config/env.js';

export function createApp({ database } = {}) {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      credentials: true,
      origin(origin, callback) {
        if (!origin || env.clientOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
    }),
  );
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

  app.use(
    '/api',
    rateLimit({
      windowMs: env.rateLimitWindowMs,
      max: env.rateLimitMax,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', env: env.nodeEnv, uptime: process.uptime() });
  });

  app.use('/api', createApiRouter(database));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
