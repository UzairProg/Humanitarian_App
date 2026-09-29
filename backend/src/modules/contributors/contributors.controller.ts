import { Request, Response, NextFunction } from 'express';
import { contributorsService } from './contributors.service';
import { AppError } from '../../middleware/error.middleware';

export class ContributorsController {
  async apply(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const profile = await contributorsService.apply(req.body, req.user);
      res.status(201).json({
        success: true,
        data: profile.toJSON(),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async getMyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const profile = await contributorsService.getMyProfile(req.user);
      res.status(200).json({
        success: true,
        data: profile ? profile.toJSON() : null,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await contributorsService.getById(req.params.id, req.user);
      res.status(200).json({
        success: true,
        data: profile,
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
      const publicOnly = req.query.publicOnly !== 'false';
      const status = req.query.status as string;

      const result = await contributorsService.list({
        page,
        limit,
        publicOnly,
        status,
      });

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

  async review(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const updated = await contributorsService.review(
        req.params.id,
        req.body,
        req.user,
      );
      res.status(200).json({
        success: true,
        data: updated.toJSON(),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
}

export const contributorsController = new ContributorsController();
