import mongoose, { Schema, Document } from 'mongoose';

export interface IBudget extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  categoryId?: mongoose.Types.ObjectId; // null = overall monthly budget
  limitAmount: number;
  limitAmountInPaise: number;
  currency: string;
  period: 'monthly' | 'weekly' | 'custom';
  startDate: Date;
  endDate: Date;
  alertThresholds: number[]; // e.g. [50, 75, 90, 100]
  alertedThresholds: number[]; // e.g. [50, 75]
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema = new Schema<IBudget>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', default: null, index: true },
    limitAmount: { type: Number, required: true, min: 1 },
    limitAmountInPaise: { type: Number, required: true, min: 100 },
    currency: { type: String, default: 'INR', uppercase: true },
    period: { type: String, enum: ['monthly', 'weekly', 'custom'], default: 'monthly' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    alertThresholds: { type: [Number], default: [50, 75, 90, 100] },
    alertedThresholds: { type: [Number], default: [] },
  },
  { timestamps: true }
);

BudgetSchema.index({ userId: 1, startDate: 1, endDate: 1 });
BudgetSchema.index({ userId: 1, categoryId: 1, startDate: 1, endDate: 1 });

export const Budget = mongoose.model<IBudget>('Budget', BudgetSchema);

