import mongoose, { Schema, Document } from 'mongoose';

export interface IGoalContribution {
  amount: number;
  amountInPaise: number;
  date: Date;
  notes?: string;
}

export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  targetAmount: number;
  targetAmountInPaise: number;
  currentAmount: number;
  currentAmountInPaise: number;
  targetDate?: Date;
  currency: string;
  status: 'in_progress' | 'achieved' | 'paused';
  contributions: IGoalContribution[];
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    targetAmount: { type: Number, required: true, min: 1 },
    targetAmountInPaise: { type: Number, required: true, min: 100 },
    currentAmount: { type: Number, default: 0, min: 0 },
    currentAmountInPaise: { type: Number, default: 0, min: 0 },
    targetDate: { type: Date },
    currency: { type: String, default: 'INR', uppercase: true },
    status: {
      type: String,
      enum: ['in_progress', 'achieved', 'paused'],
      default: 'in_progress',
      index: true,
    },
    contributions: [
      {
        amount: { type: Number, required: true },
        amountInPaise: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        notes: { type: String, trim: true },
      },
    ],
  },
  { timestamps: true }
);

export const Goal = mongoose.model<IGoal>('Goal', GoalSchema);

