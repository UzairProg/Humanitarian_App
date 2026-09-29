import { Request, Response, NextFunction } from 'express';
import { requestsService } from './requests.service';
import { AppError } from '../../middleware/error.middleware';

export class RequestsController {
  async listCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await requestsService.listCategories();
      res.status(200).json({
        success: true,
        data: categories.map((c) => c.toJSON()),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const saved = await requestsService.create(req.body, req.user);
      res.status(201).json({
        success: true,
        data: saved.toJSON(),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 100);
      const status = req.query.status as any;
      const categoryId = req.query.categoryId as string;
      const organizationId = req.query.organizationId as string;
      const search = req.query.search as string;

      const result = await requestsService.list(req.user, {
        page,
        limit,
        status,
        categoryId,
        organizationId,
        search,
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

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const result = await requestsService.getById(req.params.id, req.user);
      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }
      const { status, reason, matchedOrganizationId } = req.body;
      if (!status) {
        throw new AppError('Status is required', 400);
      }

      const updated = await requestsService.updateStatus(
        req.params.id,
        { status, reason, matchedOrganizationId },
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

export const requestsController = new RequestsController();
