import { Request, Response, NextFunction } from 'express';
import { organizationsService } from './organizations.service';
import { AppError } from '../../middleware/error.middleware';

export class OrganizationsController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 100);
      const search = req.query.search as string;
      const verificationStatus = req.query.verificationStatus as any;
      const location = req.query.location as string;

      const result = await organizationsService.list({
        page,
        limit,
        search,
        verificationStatus,
        location,
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
      const org = await organizationsService.getById(req.params.id);
      res.status(200).json({
        success: true,
        data: org,
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
      const { name, description, location, contactEmail, contactPhone, logoUrl } = req.body;
      if (!name || !description || !location || !contactEmail) {
        throw new AppError('Name, description, location, and contactEmail are required', 400);
      }

      const org = await organizationsService.create(req.body, req.user);
      res.status(201).json({
        success: true,
        data: org.toJSON(),
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
      const { status, decision, notes } = req.body;
      if (!status) {
        throw new AppError('Verification status is required', 400);
      }

      const org = await organizationsService.verify(
        req.params.id,
        { status, decision, notes },
        req.user,
      );

      res.status(200).json({
        success: true,
        data: org.toJSON(),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const dashboard = await organizationsService.getDashboard(req.params.id, req.user);
      res.status(200).json({
        success: true,
        data: dashboard,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async getMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const members = await organizationsService.getMembers(req.params.id, req.user);
      res.status(200).json({
        success: true,
        data: members,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async addMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }
      const { userId, role } = req.body;
      if (!userId) {
        throw new AppError('userId is required', 400);
      }

      const member = await organizationsService.addMember(
        req.params.id,
        { userId, role },
        req.user,
      );

      res.status(201).json({
        success: true,
        data: member,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
}

export const organizationsController = new OrganizationsController();
