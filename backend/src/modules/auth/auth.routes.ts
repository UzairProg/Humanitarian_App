import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticateJwt } from '../../middleware/auth.middleware';
import { authRateLimiter } from '../../middleware/rate-limit.middleware';

const router = Router();

router.post('/register', authRateLimiter, (req, res, next) =>
  authController.register(req, res, next),
);
router.post('/login', authRateLimiter, (req, res, next) =>
  authController.login(req, res, next),
);
router.post('/refresh', (req, res, next) => authController.refresh(req, res, next));
router.get('/me', authenticateJwt, (req, res, next) => authController.me(req, res, next));

export const authRouter = router;
