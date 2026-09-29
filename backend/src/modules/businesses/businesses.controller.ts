import { Request, Response, NextFunction } from 'express';
import { businessesService } from './businesses.service';
import { AppError } from '../../middleware/error.middleware';

export class BusinessesController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const business = await businessesService.create(req.body, req.user);
      res.status(201).json({
        success: true,
        data: business.toJSON(),
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
      const category = req.query.category as string;
      const verifiedOnly = req.query.verifiedOnly === 'true';
      const search = req.query.search as string;

      const result = await businessesService.list({
        page,
        limit,
        category,
        verifiedOnly,
        search,
      });

      res.status(200).json({
        success: true,
        data: result.items.map((b) => b.toJSON()),
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
      const business = await businessesService.getById(req.params.id);
      res.status(200).json({
        success: true,
        data: business.toJSON(),
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

      const business = await businessesService.update(
        req.params.id,
        req.body,
        req.user,
      );
      res.status(200).json({
        success: true,
        data: business.toJSON(),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async verify(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const business = await businessesService.verify(
        req.params.id,
        req.body,
        req.user,
      );
      res.status(200).json({
        success: true,
        data: business.toJSON(),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async createParticipation(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const participation = await businessesService.createParticipation(
        req.params.id,
        req.body,
        req.user,
      );
      res.status(201).json({
        success: true,
        data: participation.toJSON(),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async listParticipations(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const items = await businessesService.listParticipations(
        req.params.id,
        req.user,
      );
      res.status(200).json({
        success: true,
        data: items.map((i) => i.toJSON()),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async updateParticipationStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const updated = await businessesService.updateParticipationStatus(
        req.params.participationId,
        req.body.status,
        req.body.notes,
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

export const businessesController = new BusinessesController();
