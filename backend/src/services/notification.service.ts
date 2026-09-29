import { NotificationModel, NotificationDocument } from '../models/notification.model';

export interface CreateNotificationOptions {
  userId: string;
  type: string;
  title: string;
  body: string;
  referenceType?: string;
  referenceId?: string;
  payload?: Record<string, any>;
}

export class NotificationService {
  async create(opts: CreateNotificationOptions): Promise<NotificationDocument> {
    const notification = await NotificationModel.create({
      userId: opts.userId,
      type: opts.type,
      title: opts.title,
      body: opts.body,
      referenceType: opts.referenceType || null,
      referenceId: opts.referenceId || null,
      payload: opts.payload || {},
      readAt: null,
    });
    return notification;
  }

  async getUserNotifications(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ items: any[]; total: number; unreadCount: number }> {
    const [items, total, unreadCount] = await Promise.all([
      NotificationModel.find({ userId })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      NotificationModel.countDocuments({ userId }).exec(),
      NotificationModel.countDocuments({ userId, readAt: null }).exec(),
    ]);

    return {
      items: items.map((n) => n.toJSON()),
      total,
      unreadCount,
    };
  }

  async markAsRead(notificationId: string, userId: string): Promise<any> {
    const notification = await NotificationModel.findOneAndUpdate(
      { _id: notificationId, userId },
      { readAt: new Date() },
      { new: true },
    ).exec();

    return notification ? notification.toJSON() : null;
  }

  async markAllAsRead(userId: string): Promise<{ modifiedCount: number }> {
    const result = await NotificationModel.updateMany(
      { userId, readAt: null },
      { readAt: new Date() },
    ).exec();

    return { modifiedCount: result.modifiedCount };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return NotificationModel.countDocuments({ userId, readAt: null }).exec();
  }
}

export const notificationService = new NotificationService();
