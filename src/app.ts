import 'reflect-metadata';
import express, { Application, Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { config } from './config/app.config';
import { errorHandler } from './common/middlewares/error-handler.middleware';
import { rateLimiter } from './common/middlewares/rate-limiter.middleware';

import userRoutes from './modules/users/user.routes';

export const createApp = (): Application => {
  const app: Express = express();

  // Middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(helmet());
  app.use(rateLimiter);
  app.use(morgan('dev'));

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Routes
  app.use(`/users`, userRoutes);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
};
