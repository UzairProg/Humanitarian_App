import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { AppError } from '../../middleware/error.middleware';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, firstName, lastName, phone, locale, timezone } = req.body;

      if (!email || !password || !firstName || !lastName) {
        throw new AppError('Email, password, firstName, and lastName are required', 400);
      }
      if (typeof password !== 'string' || password.length < 8) {
        throw new AppError('Password must be at least 8 characters long', 400);
      }

      const session = await authService.register(
        { email, password, firstName, lastName, phone, locale, timezone },
        req.requestId,
        req.ip,
      );

      res.status(201).json({
        success: true,
        data: session,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new AppError('Email and password are required', 400);
      }

      const session = await authService.login({ email, password }, req.requestId, req.ip);

      res.status(200).json({
        success: true,
        data: session,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new AppError('Refresh token is required', 400);
      }

      const tokens = await authService.refreshTokens(refreshToken);

      res.status(200).json({
        success: true,
        data: tokens,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401, 'UNAUTHORIZED');
      }

      const user = await authService.getCurrentUser(req.user.sub);

      res.status(200).json({
        success: true,
        data: {
          user: user.toJSON(),
          roles: req.user.roles,
          permissions: req.user.permissions,
          orgId: req.user.orgId,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
