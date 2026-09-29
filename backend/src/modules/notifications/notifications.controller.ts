import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../../services/notification.service';
import { AppError } from '../../middleware/error.middleware';

export class NotificationsController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 100);

      const result = await notificationService.getUserNotifications(req.user.sub, page, limit);

      res.status(200).json({
        success: true,
        data: result.items,
        meta: {
          page,
          limit,
          total: result.total,
          unreadCount: result.unreadCount,
          totalPages: Math.ceil(result.total / limit) || 1,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const updated = await notificationService.markAsRead(req.params.id, req.user.sub);
      if (!updated) {
        throw new AppError('Notification not found', 404, 'NOT_FOUND');
      }

      res.status(200).json({
        success: true,
        data: updated,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async markAllRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const result = await notificationService.markAllAsRead(req.user.sub);
      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const count = await notificationService.getUnreadCount(req.user.sub);
      res.status(200).json({
        success: true,
        data: { count },
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
}

export const notificationsController = new NotificationsController();
