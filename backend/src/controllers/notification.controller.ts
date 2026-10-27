import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { notificationService } from '../services/notification.service';
import { sendSuccess } from '../utils/response';

export class NotificationController {
  static async getNotifications(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const notifications = await notificationService.getNotifications(req.user!._id);
      sendSuccess(res, notifications);
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const notification = await notificationService.markAsRead(req.user!._id, req.params.id as string);
      sendSuccess(res, notification, 'Notification marked as read.');
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await notificationService.markAllAsRead(req.user!._id);
      sendSuccess(res, { markedAll: true }, 'All notifications marked as read.');
    } catch (error) {
      next(error);
    }
  }
}
