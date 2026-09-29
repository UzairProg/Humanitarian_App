import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';
import { AppError } from '../../middleware/error.middleware';

export class UsersController {
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await usersService.getById(req.params.id);
      res.status(200).json({
        success: true,
        data: user.toJSON(),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const updated = await usersService.updateProfile(req.params.id, req.body, req.user);
      res.status(200).json({
        success: true,
        data: updated.toJSON(),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async assignRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }
      const { role } = req.body;
      if (!role) {
        throw new AppError('Role is required', 400);
      }

      const updated = await usersService.assignRole(req.params.id, role, req.user);
      res.status(200).json({
        success: true,
        data: updated.toJSON(),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 100);

      const result = await usersService.listUsers(page, limit);
      res.status(200).json({
        success: true,
        data: result.items,
        meta: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit) || 1,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
}

export const usersController = new UsersController();
