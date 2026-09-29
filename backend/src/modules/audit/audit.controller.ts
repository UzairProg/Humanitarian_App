import { Request, Response, NextFunction } from 'express';
import { auditService } from '../../services/audit.service';
import { AppError } from '../../middleware/error.middleware';

export class AuditController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = Math.min(parseInt(req.query.limit as string, 10) || 50, 100);
      const targetType = req.query.targetType as string;
      const actorId = req.query.actorId as string;

      const filters: any = {};
      if (targetType) filters.targetType = targetType;
      if (actorId) filters.actorId = actorId;

      const result = await auditService.list(page, limit, filters);

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

export const auditController = new AuditController();
