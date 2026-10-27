import mongoose from 'mongoose';
import { Insight, IInsight } from '../models/Insight';
import { Transaction } from '../models/Transaction';
import { User } from '../models/User';
import { geminiService } from './gemini.service';
import { analyticsService } from './analytics.service';
import { getMonthDateRange } from '../utils/date';
import { toRupees } from '../utils/currency';

class InsightsService {
  /**
   * Fetch active (non-dismissed) insights for user
   */
  async getInsights(userId: string | mongoose.Types.ObjectId): Promise<IInsight[]> {
    return Insight.find({
      userId,
      dismissedAt: null,
    }).sort({ generatedAt: -1 }).limit(10);
  }

  /**
   * Generate fresh grounded insights from real transaction history
   */
  async generateInsights(userId: string | mongoose.Types.ObjectId): Promise<IInsight[]> {
    const user = await User.findById(userId);
    const now = new Date();
    const currentRange = getMonthDateRange(now.getFullYear(), now.getMonth() + 1);

    // 1. Month-over-Month Comparison
    const comparison = await analyticsService.getMonthComparison(userId);
    const insightsToCreate: Partial<IInsight>[] = [];

    // Analyze Category Spending Changes
    const [currentCats, prevCats] = await Promise.all([
      analyticsService.getCategoryBreakdown(userId, now.getFullYear(), now.getMonth() + 1),
      analyticsService.getCategoryBreakdown(
        userId,
        now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(),
        now.getMonth() === 0 ? 12 : now.getMonth()
      ),
    ]);

    const prevCatMap = new Map(prevCats.map((c) => [c.name, c.amount]));

    for (const cat of currentCats) {
      const prevAmount = prevCatMap.get(cat.name) || 0;
      const diff = cat.amount - prevAmount;

      if (diff >= 500 && prevAmount > 0) {
        const metricData = {
          categoryName: cat.name,
          currentAmount: cat.amount,
          previousAmount: prevAmount,
          difference: diff,
          increasePercent: Math.round((diff / prevAmount) * 100),
        };

        const aiContext = await geminiService.generateInsightExplanation('spending_increase', metricData);

        insightsToCreate.push({
          userId: new mongoose.Types.ObjectId(userId.toString()),
          type: 'spending_increase',
          title: aiContext.title,
          explanation: aiContext.explanation,
          metrics: metricData,
          estimatedSaving: aiContext.estimatedSaving || Math.round(diff * 0.5),
          currency: 'INR',
          periodStart: currentRange.startDate,
          periodEnd: currentRange.endDate,
        });
        break; // Keep 1 strong category increase insight
      }
    }

    // 2. Target vs Daily Average Spending Insight
    if (user?.monthlySpendingTarget && user.monthlySpendingTarget > 0) {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const targetDaily = user.monthlySpendingTarget / daysInMonth;
      const actualDaily = comparison.currentMonth.dailyAverage;

      if (actualDaily > targetDaily) {
        const excess = Math.round((actualDaily - targetDaily) * daysInMonth);
        insightsToCreate.push({
          userId: new mongoose.Types.ObjectId(userId.toString()),
          type: 'budget_warning',
          title: 'Daily Spending Above Target',
          explanation: `Your average daily spending (₹${actualDaily}) is tracking above your target of ₹${Math.round(targetDaily)}/day. Adjusting discretionary purchases can help save ₹${excess}.`,
          metrics: { actualDaily, targetDaily, projectedExcess: excess },
          estimatedSaving: excess,
          currency: 'INR',
          periodStart: currentRange.startDate,
          periodEnd: currentRange.endDate,
        });
      }
    }

    // 3. Repeated Subscriptions / Recurring payments check
    const recurringTxns = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId.toString()),
          type: 'expense',
          paymentStatus: 'success',
        },
      },
      {
        $group: {
          _id: { merchant: '$merchant', amountPaise: '$amountInPaise' },
          count: { $sum: 1 },
          lastDate: { $max: '$transactionDate' },
        },
      },
      { $match: { count: { $gte: 2 }, '_id.merchant': { $ne: '' } } },
      { $limit: 3 },
    ]);

    if (recurringTxns.length > 0) {
      const sample = recurringTxns[0];
      const monthlyRecurring = toRupees(sample._id.amountPaise);
      insightsToCreate.push({
        userId: new mongoose.Types.ObjectId(userId.toString()),
        type: 'subscription_review',
        title: `Review Recurring Payment: ${sample._id.merchant}`,
        explanation: `We noticed repeated payments of ₹${monthlyRecurring} to ${sample._id.merchant}. If you no longer use this service, cancelling it could save ₹${monthlyRecurring * 12} per year.`,
        metrics: { merchant: sample._id.merchant, monthlyCost: monthlyRecurring, occurrences: sample.count },
        estimatedSaving: monthlyRecurring * 3,
        currency: 'INR',
        periodStart: currentRange.startDate,
        periodEnd: currentRange.endDate,
      });
    }

    // 4. Positive savings rate insight
    if (comparison.currentMonth.savingsRate >= 20) {
      insightsToCreate.push({
        userId: new mongoose.Types.ObjectId(userId.toString()),
        type: 'positive_habit',
        title: 'Great Savings Rate this Month!',
        explanation: `You've saved ${comparison.currentMonth.savingsRate}% of your income so far this month. Keep up this momentum!`,
        metrics: { savingsRate: comparison.currentMonth.savingsRate },
        currency: 'INR',
        periodStart: currentRange.startDate,
        periodEnd: currentRange.endDate,
      });
    }

    // Insert only if new or replace older insights of same type
    const created: IInsight[] = [];
    for (const item of insightsToCreate) {
      // Check if existing insight exists within last 7 days
      const existing = await Insight.findOne({
        userId,
        type: item.type,
        generatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      });

      if (!existing) {
        const ins = await Insight.create(item);
        created.push(ins);
      }
    }

    return this.getInsights(userId);
  }

  async dismissInsight(userId: string | mongoose.Types.ObjectId, id: string): Promise<void> {
    await Insight.findOneAndUpdate(
      { _id: id, userId },
      { dismissedAt: new Date() }
    );
  }

  async submitFeedback(
    userId: string | mongoose.Types.ObjectId,
    id: string,
    feedback: 'helpful' | 'not_helpful'
  ): Promise<void> {
    await Insight.findOneAndUpdate(
      { _id: id, userId },
      { feedback }
    );
  }
}

export const insightsService = new InsightsService();

