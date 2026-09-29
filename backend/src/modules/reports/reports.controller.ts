import { Request, Response, NextFunction } from 'express';
import { reportsService } from './reports.service';
import { AppError } from '../../middleware/error.middleware';

export class ReportsController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const report = await reportsService.create(req.body, req.user.sub);
      res.status(201).json({
        success: true,
        data: report.toJSON(),
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
      const status = req.query.status as any;

      const result = await reportsService.list(page, limit, status);
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

  async resolve(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }
      const { resolution } = req.body;
      if (!resolution) {
        throw new AppError('Resolution notes are required', 400);
      }

      const report = await reportsService.resolve(req.params.id, resolution, req.user.sub);
      res.status(200).json({
        success: true,
        data: report.toJSON(),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
}

export const reportsController = new ReportsController();
