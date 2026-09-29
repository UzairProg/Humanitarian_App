import { Request, Response, NextFunction } from 'express';
import { impactService } from '../../services/impact.service';

export class ImpactController {
  async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await impactService.getPlatformSummary();
      res.status(200).json({
        success: true,
        data: summary,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async getOrganizationImpact(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const impact = await impactService.getOrganizationImpact(req.params.orgId);
      res.status(200).json({
        success: true,
        data: impact,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
}

export const impactController = new ImpactController();
