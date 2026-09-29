import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { env } from './config/env';
import { apiV1Router } from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { standardRateLimiter } from './middleware/rate-limit.middleware';

export function createApp(): Application {
  const app: Application = express();

  // 1. Trust proxy for rate limiting behind reverse proxies
  app.set('trust proxy', 1);

  // 2. Security Headers via Helmet
  app.use(
    helmet({
      contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // 3. CORS Configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || env.CORS_ORIGIN.includes(origin) || env.CORS_ORIGIN.includes('*')) {
          callback(null, true);
        } else {
          callback(new Error('Origin blocked by CORS policy'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
    }),
  );

  // 4. Request ID Assignment
  app.use((req: Request, res: Response, next: NextFunction) => {
    req.requestId = (req.headers['x-request-id'] as string) || uuidv4();
    res.setHeader('x-request-id', req.requestId);
    next();
  });

  // 5. Body Parsing with Safe Payload Limits
  app.use(express.json({ limit: `${env.STORAGE_MAX_FILE_SIZE_MB}mb` }));
  app.use(express.urlencoded({ extended: true, limit: `${env.STORAGE_MAX_FILE_SIZE_MB}mb` }));

  // 6. Global Rate Limiter
  app.use(standardRateLimiter);

  // 7. Root & Health Endpoints
  app.get('/', (req: Request, res: Response) => {
    res.json({
      name: env.APP_NAME,
      version: '2.0.0',
      status: 'operational',
      architecture: 'MERN (MongoDB + Express.js + React + Node.js)',
      docs: '/api/v1',
    });
  });

  app.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'al-husseiniya-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // 8. Mount Modular REST API
  app.use(`/${env.API_PREFIX}`, apiV1Router);

  // 9. 404 & Centralized Error Handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export const app = createApp();
export default app;
