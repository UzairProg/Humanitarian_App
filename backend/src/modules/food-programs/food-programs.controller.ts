import { Request, Response, NextFunction } from 'express';
import { foodProgramsService } from './food-programs.service';
import { AppError } from '../../middleware/error.middleware';

export class FoodProgramsController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 100);
      const organizationId = req.query.organizationId as string;
      const programDate = req.query.programDate as string;
      const location = req.query.location as string;
      const search = req.query.search as string;

      const result = await foodProgramsService.list(
        { page, limit, organizationId, programDate, location, search },
        req.user,
      );

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
      const program = await foodProgramsService.getById(req.params.id);
      res.status(200).json({
        success: true,
        data: program.toJSON(),
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

      const { organizationId, title, description, location, programDate, startTime, endTime, capacity, instructions } = req.body;
      if (!organizationId || !title || !description || !location || !programDate || !startTime || !endTime) {
        throw new AppError('Missing required program fields', 400);
      }

      const program = await foodProgramsService.create(req.body, req.user);
      res.status(201).json({
        success: true,
        data: program.toJSON(),
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

      const program = await foodProgramsService.update(req.params.id, req.body, req.user);
      res.status(200).json({
        success: true,
        data: program.toJSON(),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async reserve(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const count = parseInt(req.body.count || '1', 10);
      const program = await foodProgramsService.reserve(req.params.id, count, req.user);

      res.status(200).json({
        success: true,
        data: program.toJSON(),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
}

export const foodProgramsController = new FoodProgramsController();
