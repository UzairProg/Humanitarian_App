import { Request, Response, NextFunction } from 'express';
import { volunteersService } from './volunteers.service';
import { AppError } from '../../middleware/error.middleware';

export class VolunteersController {
  async upsertProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const profile = await volunteersService.upsertProfile(req.user.sub, req.body);
      res.status(200).json({
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

      const profile = await volunteersService.getMyProfile(req.user.sub);
      res.status(200).json({
        success: true,
        data: profile ? profile.toJSON() : null,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async listOpportunities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 100);
      const organizationId = req.query.organizationId as string;
      const category = req.query.category as string;
      const search = req.query.search as string;
      const status = req.query.status as string;

      const result = await volunteersService.listOpportunities({
        page,
        limit,
        organizationId,
        category,
        search,
        status,
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

  async getOpportunityById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const opp = await volunteersService.getOpportunityById(req.params.id);
      res.status(200).json({
        success: true,
        data: opp.toJSON(),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async createOpportunity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const opp = await volunteersService.createOpportunity(req.body, req.user);
      res.status(201).json({
        success: true,
        data: opp.toJSON(),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async updateOpportunity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const opp = await volunteersService.updateOpportunity(
        req.params.id,
        req.body,
        req.user,
      );
      res.status(200).json({
        success: true,
        data: opp.toJSON(),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async apply(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const app = await volunteersService.apply(
        req.params.id,
        req.user,
        req.body.message,
      );
      res.status(201).json({
        success: true,
        data: app.toJSON(),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async listApplicationsForOpportunity(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const apps = await volunteersService.listApplicationsForOpportunity(
        req.params.id,
        req.user,
      );
      res.status(200).json({
        success: true,
        data: apps,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async getMyApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const apps = await volunteersService.getMyApplications(req.user.sub);
      res.status(200).json({
        success: true,
        data: apps,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async updateApplicationStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const app = await volunteersService.updateApplicationStatus(
        req.params.id,
        req.body.status,
        req.body.reviewNotes,
        req.user,
      );
      res.status(200).json({
        success: true,
        data: app.toJSON(),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
}

export const volunteersController = new VolunteersController();
