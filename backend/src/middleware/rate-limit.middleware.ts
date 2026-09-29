import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

export const standardRateLimiter = rateLimit({
  windowMs: env.THROTTLE_TTL * 1000,
  limit: env.THROTTLE_LIMIT,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests, please try again later.',
    },
    timestamp: new Date().toISOString(),
  },
  skip: () => env.NODE_ENV === 'test', // Skip in tests
});

export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 15, // 15 auth attempts per min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many login attempts, please try again after 60 seconds.',
    },
    timestamp: new Date().toISOString(),
  },
  skip: () => env.NODE_ENV === 'test',
});
