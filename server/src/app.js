import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import config from './config/env.js';
import { AppError } from './lib/errors.js';
import { isGitHubTokenConfigured } from './lib/github.js';
import analyzeRouter from './routes/analyze.js';

export const createApp = () => {
  const app = express();
  const allowedOrigins = new Set(config.clientOrigins);

  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.size === 0 || allowedOrigins.has(origin)) {
          return callback(null, true);
        }

        return callback(new AppError('CORS origin is not allowed.', 403));
      }
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('dev'));

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      githubTokenConfigured: isGitHubTokenConfigured(),
      timestamp: new Date().toISOString()
    });
  });

  app.use(analyzeRouter);

  app.use((_req, res) => {
    res.status(404).json({
      message: 'Route not found.'
    });
  });

  app.use((error, _req, res, _next) => {
    const statusCode = error.statusCode || 500;

    res.status(statusCode).json({
      message: error.message || 'Internal server error.',
      details: error.details || undefined
    });
  });

  return app;
};
