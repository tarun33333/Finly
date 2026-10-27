import mongoose, { Schema, Document } from 'mongoose';

export type InsightType =
  | 'spending_increase'
  | 'budget_warning'
  | 'subscription_review'
  | 'saving_opportunity'
  | 'positive_habit'
  | 'unusual_expense';

export interface IInsight extends Document {
  userId: mongoose.Types.ObjectId;
  type: InsightType;
  title: string;
  explanation: string;
  metrics: Record<string, any>;
  estimatedSaving?: number;
  currency: string;
  periodStart: Date;
  periodEnd: Date;
  generatedAt: Date;
  dismissedAt?: Date;
  feedback?: 'helpful' | 'not_helpful';
  createdAt: Date;
  updatedAt: Date;
}

const InsightSchema = new Schema<IInsight>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'spending_increase',
        'budget_warning',
        'subscription_review',
        'saving_opportunity',
        'positive_habit',
        'unusual_expense',
      ],
      required: true,
    },
    title: { type: String, required: true },
    explanation: { type: String, required: true },
    metrics: { type: Schema.Types.Mixed, default: {} },
    estimatedSaving: { type: Number, min: 0 },
    currency: { type: String, default: 'INR', uppercase: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    generatedAt: { type: Date, default: Date.now },
    dismissedAt: { type: Date, default: null },
    feedback: { type: String, enum: ['helpful', 'not_helpful'], default: null },
  },
  { timestamps: true }
);

InsightSchema.index({ userId: 1, dismissedAt: 1, generatedAt: -1 });

export const Insight = mongoose.model<IInsight>('Insight', InsightSchema);

