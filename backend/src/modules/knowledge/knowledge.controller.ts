import { Request, Response, NextFunction } from 'express';
import { knowledgeService } from './knowledge.service';
import { AppError } from '../../middleware/error.middleware';

export class KnowledgeController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const article = await knowledgeService.create(req.body, req.user);
      res.status(201).json({
        success: true,
        data: article.toJSON(),
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
      const lang = (req.query.lang as string) || 'en';
      const category = req.query.category as string;
      const search = req.query.search as string;

      const result = await knowledgeService.listPublished({
        page,
        limit,
        lang,
        category,
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
      const article = await knowledgeService.getById(req.params.id, req.user);
      res.status(200).json({
        success: true,
        data: article.toJSON(),
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

      const updated = await knowledgeService.update(
        req.params.id,
        req.body,
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

  async submitForReview(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const updated = await knowledgeService.submitForReview(
        req.params.id,
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

  async review(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const reviewed = await knowledgeService.review(
        req.params.id,
        req.body,
        req.user,
      );
      res.status(200).json({
        success: true,
        data: reviewed.toJSON(),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async publish(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const published = await knowledgeService.publish(req.params.id, req.user);
      res.status(200).json({
        success: true,
        data: published.toJSON(),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async getMyArticles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const articles = await knowledgeService.getMyArticles(req.user.sub);
      res.status(200).json({
        success: true,
        data: articles.map((a) => a.toJSON()),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async getAdminQueue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 100);

      const result = await knowledgeService.getAdminQueue({ page, limit });
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
}

export const knowledgeController = new KnowledgeController();
