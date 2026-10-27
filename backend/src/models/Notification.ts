import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType =
  | 'budget_alert'
  | 'high_spending'
  | 'goal_reached'
  | 'weekly_summary'
  | 'system';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  relatedResourceId?: mongoose.Types.ObjectId;
  relatedResourceType?: 'budget' | 'goal' | 'transaction';
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['budget_alert', 'high_spending', 'goal_reached', 'weekly_summary', 'system'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedResourceId: { type: Schema.Types.ObjectId },
    relatedResourceType: { type: String, enum: ['budget', 'goal', 'transaction'] },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, readAt: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

