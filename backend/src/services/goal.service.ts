import mongoose from 'mongoose';
import { Goal, IGoal } from '../models/Goal';
import { toPaise, toRupees } from '../utils/currency';
import { AppError } from '../middleware/errorHandler';

export interface CreateGoalDTO {
  userId: string | mongoose.Types.ObjectId;
  title: string;
  targetAmount: number;
  currency?: string;
  targetDate?: Date | string;
}

class GoalService {
  async createGoal(dto: CreateGoalDTO): Promise<IGoal> {
    const targetAmountInPaise = toPaise(dto.targetAmount);

    return Goal.create({
      userId: dto.userId,
      title: dto.title,
      targetAmount: dto.targetAmount,
      targetAmountInPaise,
      currency: dto.currency || 'INR',
      targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
    });
  }

  async getGoals(userId: string | mongoose.Types.ObjectId) {
    const goals = await Goal.find({ userId }).sort({ createdAt: -1 });
    return goals.map((g) => {
      const remainingAmount = Math.max(0, g.targetAmount - g.currentAmount);
      const percentage = Math.min(100, Math.round((g.currentAmountInPaise / g.targetAmountInPaise) * 100));

      // Calculate suggested monthly contribution if target date is set
      let suggestedMonthly = 0;
      if (g.targetDate && remainingAmount > 0) {
        const now = new Date();
        const target = new Date(g.targetDate);
        const monthsLeft = Math.max(1, (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth()));
        suggestedMonthly = Math.round(remainingAmount / monthsLeft);
      }

      return {
        ...g.toJSON(),
        remainingAmount,
        percentage,
        suggestedMonthly,
      };
    });
  }

  async addContribution(
    userId: string | mongoose.Types.ObjectId,
    goalId: string,
    amount: number,
    notes?: string
  ): Promise<IGoal> {
    const goal = await Goal.findOne({ _id: goalId, userId });
    if (!goal) {
      throw new AppError('Goal not found.', 404, 'NOT_FOUND');
    }

    const amountInPaise = toPaise(amount);
    goal.currentAmount += amount;
    goal.currentAmountInPaise += amountInPaise;

    goal.contributions.push({
      amount,
      amountInPaise,
      date: new Date(),
      notes,
    });

    if (goal.currentAmountInPaise >= goal.targetAmountInPaise) {
      goal.status = 'achieved';
    }

    await goal.save();
    return goal;
  }

  async deleteGoal(userId: string | mongoose.Types.ObjectId, id: string): Promise<void> {
    const result = await Goal.deleteOne({ _id: id, userId });
    if (result.deletedCount === 0) {
      throw new AppError('Goal not found.', 404, 'NOT_FOUND');
    }
  }
}

export const goalService = new GoalService();

