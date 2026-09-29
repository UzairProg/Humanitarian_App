import { Request, Response, NextFunction } from 'express';
import { eventsService } from './events.service';
import { AppError } from '../../middleware/error.middleware';

export class EventsController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 100);
      const organizationId = req.query.organizationId as string;
      const search = req.query.search as string;

      const result = await eventsService.list({ page, limit, organizationId, search });

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
      const event = await eventsService.getById(req.params.id);
      res.status(200).json({
        success: true,
        data: event.toJSON(),
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

      const event = await eventsService.create(req.body, req.user.sub);
      res.status(201).json({
        success: true,
        data: event.toJSON(),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
}

export const eventsController = new EventsController();
