import { Request, Response, NextFunction } from 'express';
import { searchService } from './search.service';

export class SearchController {
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const q = (req.query.q as string) || '';
      const type = (req.query.type as string) || 'all';
      const limit = Math.min(parseInt(req.query.limit as string, 10) || 5, 20);

      const result = await searchService.search(q, type, limit);
      res.status(200).json({
        success: true,
        data: result.results,
        meta: {
          total: result.total,
          query: q,
          type,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
}

export const searchController = new SearchController();
