import mongoose from 'mongoose';
import { Notification, INotification } from '../models/Notification';
import { AppError } from '../middleware/errorHandler';

class NotificationService {
  async getNotifications(userId: string | mongoose.Types.ObjectId): Promise<INotification[]> {
    return Notification.find({ userId }).sort({ createdAt: -1 }).limit(30);
  }

  async markAsRead(userId: string | mongoose.Types.ObjectId, id: string): Promise<INotification> {
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { readAt: new Date() },
      { new: true }
    );
    if (!notification) {
      throw new AppError('Notification not found.', 404, 'NOT_FOUND');
    }
    return notification;
  }

  async markAllAsRead(userId: string | mongoose.Types.ObjectId): Promise<void> {
    await Notification.updateMany({ userId, readAt: null }, { readAt: new Date() });
  }
}

export const notificationService = new NotificationService();

