import mongoose from 'mongoose';
import { Budget, IBudget } from '../models/Budget';
import { Transaction } from '../models/Transaction';
import { Notification } from '../models/Notification';
import { toPaise, toRupees } from '../utils/currency';
import { AppError } from '../middleware/errorHandler';

export interface CreateBudgetDTO {
  userId: string | mongoose.Types.ObjectId;
  name: string;
  categoryId?: string | null;
  limitAmount: number;
  currency?: string;
  period?: 'monthly' | 'weekly' | 'custom';
  startDate: Date | string;
  endDate: Date | string;
  alertThresholds?: number[];
}

class BudgetService {
  async createBudget(dto: CreateBudgetDTO): Promise<IBudget> {
    const limitAmountInPaise = toPaise(dto.limitAmount);

    const budget = await Budget.create({
      userId: dto.userId,
      name: dto.name,
      categoryId: dto.categoryId ? new mongoose.Types.ObjectId(dto.categoryId) : null,
      limitAmount: dto.limitAmount,
      limitAmountInPaise,
      currency: dto.currency || 'INR',
      period: dto.period || 'monthly',
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      alertThresholds: dto.alertThresholds || [50, 75, 90, 100],
      alertedThresholds: [],
    });

    return (await budget.populate('categoryId')) as IBudget;
  }

  async getBudgets(userId: string | mongoose.Types.ObjectId) {
    const budgets = await Budget.find({ userId }).populate('categoryId').sort({ createdAt: -1 });

    // Calculate progress for each budget
    const results = await Promise.all(
      budgets.map(async (budget) => {
        const progress = await this.getBudgetProgress(userId, budget);
        return {
          ...budget.toJSON(),
          progress,
        };
      })
    );

    return results;
  }

  async getBudgetById(userId: string | mongoose.Types.ObjectId, id: string) {
    const budget = await Budget.findOne({ _id: id, userId }).populate('categoryId');
    if (!budget) {
      throw new AppError('Budget not found.', 404, 'NOT_FOUND');
    }
    const progress = await this.getBudgetProgress(userId, budget);
    return {
      ...budget.toJSON(),
      progress,
    };
  }

  async updateBudget(
    userId: string | mongoose.Types.ObjectId,
    id: string,
    updates: Partial<CreateBudgetDTO>
  ): Promise<IBudget> {
    const budget = await Budget.findOne({ _id: id, userId });
    if (!budget) {
      throw new AppError('Budget not found.', 404, 'NOT_FOUND');
    }

    if (updates.name) budget.name = updates.name;
    if (updates.categoryId !== undefined) {
      budget.categoryId = updates.categoryId ? new mongoose.Types.ObjectId(updates.categoryId) : undefined;
    }
    if (updates.limitAmount !== undefined) {
      budget.limitAmount = updates.limitAmount;
      budget.limitAmountInPaise = toPaise(updates.limitAmount);
    }
    if (updates.period) budget.period = updates.period;
    if (updates.startDate) budget.startDate = new Date(updates.startDate);
    if (updates.endDate) budget.endDate = new Date(updates.endDate);
    if (updates.alertThresholds) budget.alertThresholds = updates.alertThresholds;

    await budget.save();
    return (await budget.populate('categoryId')) as IBudget;
  }

  async deleteBudget(userId: string | mongoose.Types.ObjectId, id: string): Promise<void> {
    const result = await Budget.deleteOne({ _id: id, userId });
    if (result.deletedCount === 0) {
      throw new AppError('Budget not found.', 404, 'NOT_FOUND');
    }
  }

  /**
   * Calculate budget consumption, percentage, remaining, and projected spending
   */
  async getBudgetProgress(userId: string | mongoose.Types.ObjectId, budget: IBudget) {
    const match: any = {
      userId: new mongoose.Types.ObjectId(userId.toString()),
      type: 'expense',
      paymentStatus: 'success',
      transactionDate: { $gte: budget.startDate, $lte: budget.endDate },
    };

    if (budget.categoryId) {
      match.categoryId = budget.categoryId;
    }

    const result = await Transaction.aggregate([
      { $match: match },
      { $group: { _id: null, totalSpentPaise: { $sum: '$amountInPaise' } } },
    ]);

    const spentPaise = result[0]?.totalSpentPaise || 0;
    const spentRupees = toRupees(spentPaise);
    const remainingRupees = Math.max(0, toRupees(budget.limitAmountInPaise - spentPaise));
    const percentage = Math.min(100, Math.round((spentPaise / budget.limitAmountInPaise) * 100));

    // Projection calculation: based on days elapsed vs total days in budget period
    const now = new Date();
    const start = new Date(budget.startDate).getTime();
    const end = new Date(budget.endDate).getTime();
    const totalDays = Math.max(1, (end - start) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.max(1, Math.min(totalDays, (now.getTime() - start) / (1000 * 60 * 60 * 24)));
    
    const dailyAverage = spentRupees / elapsedDays;
    const projectedSpend = Math.round(dailyAverage * totalDays);

    // Check thresholds and trigger alerts without duplicates
    await this.checkThresholdAlerts(budget, percentage, spentRupees);

    return {
      spent: spentRupees,
      remaining: remainingRupees,
      percentage,
      isOverBudget: spentPaise > budget.limitAmountInPaise,
      overAmount: spentPaise > budget.limitAmountInPaise ? toRupees(spentPaise - budget.limitAmountInPaise) : 0,
      dailyAverage: Math.round(dailyAverage),
      projectedSpend,
    };
  }

  private async checkThresholdAlerts(budget: IBudget, percentage: number, spent: number) {
    const thresholds = budget.alertThresholds.sort((a, b) => a - b);
    for (const t of thresholds) {
      if (percentage >= t && !budget.alertedThresholds.includes(t)) {
        budget.alertedThresholds.push(t);
        await budget.save();

        await Notification.create({
          userId: budget.userId,
          type: 'budget_alert',
          title: `Budget Alert: ${budget.name} (${t}%)`,
          message: `You have reached ${t}% of your ${budget.name} budget. Spent: ₹${spent} of ₹${budget.limitAmount}.`,
          relatedResourceId: budget._id,
          relatedResourceType: 'budget',
        });
      }
    }
  }
}

export const budgetService = new BudgetService();

