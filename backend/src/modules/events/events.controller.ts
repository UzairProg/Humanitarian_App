import { Request, Response, NextFunction } from 'express';
import { eventsService } from './events.service';
import { AppError } from '../../middleware/error.middleware';

export class EventsController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 100);
      const organizationId = req.query.organizationId as string;
      const category = req.query.category as string;
      const status = req.query.status as string;
      const search = req.query.search as string;

      const result = await eventsService.list({
        page,
        limit,
        organizationId,
        category,
        status,
        search,
      });

      res.status(200).json({
        success: true,
        data: result.items.map((i) => i.toJSON()),
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

      const event = await eventsService.create(req.body, req.user);
      res.status(201).json({
        success: true,
        data: event.toJSON(),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const event = await eventsService.update(req.params.id, req.body, req.user);
      res.status(200).json({
        success: true,
        data: event.toJSON(),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const reg = await eventsService.register(
        req.params.id,
        req.user,
        req.body.notes,
      );
      res.status(201).json({
        success: true,
        data: reg.toJSON(),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async cancelRegistration(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const cancelled = await eventsService.cancelRegistration(
        req.params.id,
        req.user,
      );
      res.status(200).json({
        success: true,
        data: cancelled.toJSON(),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async listRegistrations(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const attendees = await eventsService.listRegistrations(
        req.params.id,
        req.user,
      );
      res.status(200).json({
        success: true,
        data: attendees,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async getMyRegistrations(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const list = await eventsService.getMyRegistrations(req.user.sub);
      res.status(200).json({
        success: true,
        data: list,
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

      const event = await eventsService.updateStatus(
        req.params.id,
        req.body.status,
        req.user,
      );
      res.status(200).json({
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
