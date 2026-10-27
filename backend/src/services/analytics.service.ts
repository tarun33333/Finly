import mongoose from 'mongoose';
import { Transaction } from '../models/Transaction';
import { getMonthDateRange } from '../utils/date';
import { toRupees } from '../utils/currency';

class AnalyticsService {
  /**
   * Analytics Overview for a specific month/year
   */
  async getOverview(userId: string | mongoose.Types.ObjectId, year?: number, month?: number) {
    const { startDate, endDate } = getMonthDateRange(year, month);
    const uId = new mongoose.Types.ObjectId(userId.toString());

    const result = await Transaction.aggregate([
      {
        $match: {
          userId: uId,
          paymentStatus: 'success',
          transactionDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$type',
          totalPaise: { $sum: '$amountInPaise' },
          count: { $sum: 1 },
        },
      },
    ]);

    let incomePaise = 0;
    let expensePaise = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    for (const item of result) {
      if (item._id === 'income') {
        incomePaise = item.totalPaise;
        incomeCount = item.count;
      } else if (item._id === 'expense') {
        expensePaise = item.totalPaise;
        expenseCount = item.count;
      }
    }

    const income = toRupees(incomePaise);
    const expense = toRupees(expensePaise);
    const netFlow = toRupees(incomePaise - expensePaise);
    const savingsRate = income > 0 ? Math.max(0, Math.round(((income - expense) / income) * 100)) : 0;

    // Days in target month
    const totalDays = new Date(startDate.getUTCFullYear(), startDate.getUTCMonth() + 1, 0).getDate();
    const dailyAverage = Math.round(expense / totalDays);

    return {
      period: { startDate, endDate },
      income,
      expense,
      netFlow,
      savingsRate,
      dailyAverage,
      transactionCount: incomeCount + expenseCount,
    };
  }

  /**
   * Daily spending trend (e.g. last 7 or 30 days)
   */
  async getSpendingTrend(userId: string | mongoose.Types.ObjectId, days = 7) {
    const uId = new mongoose.Types.ObjectId(userId.toString());
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const results = await Transaction.aggregate([
      {
        $match: {
          userId: uId,
          type: 'expense',
          paymentStatus: 'success',
          transactionDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$transactionDate', timezone: '+05:30' } },
          totalPaise: { $sum: '$amountInPaise' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill missing days with zero
    const trendMap = new Map<string, { amount: number; count: number }>();
    results.forEach((r) => trendMap.set(r._id, { amount: toRupees(r.totalPaise), count: r.count }));

    const trend = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      const key = current.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      const dayName = current.toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'Asia/Kolkata' });
      const data = trendMap.get(key) || { amount: 0, count: 0 };
      trend.push({
        date: key,
        day: dayName,
        amount: data.amount,
        count: data.count,
      });
      current.setDate(current.getDate() + 1);
    }

    return trend;
  }

  /**
   * Category expense breakdown with percentage
   */
  async getCategoryBreakdown(userId: string | mongoose.Types.ObjectId, year?: number, month?: number) {
    const { startDate, endDate } = getMonthDateRange(year, month);
    const uId = new mongoose.Types.ObjectId(userId.toString());

    const result = await Transaction.aggregate([
      {
        $match: {
          userId: uId,
          type: 'expense',
          paymentStatus: 'success',
          transactionDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$categoryId',
          totalPaise: { $sum: '$amountInPaise' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      { $sort: { totalPaise: -1 } },
    ]);

    const totalExpensePaise = result.reduce((acc, curr) => acc + curr.totalPaise, 0);

    return result.map((item) => {
      const amount = toRupees(item.totalPaise);
      const percentage = totalExpensePaise > 0 ? Math.round((item.totalPaise / totalExpensePaise) * 100) : 0;
      return {
        categoryId: item._id,
        name: item.category.name,
        icon: item.category.icon,
        color: item.category.color,
        amount,
        count: item.count,
        percentage,
      };
    });
  }

  /**
   * Payment method breakdown (UPI, Cash, etc.)
   */
  async getPaymentMethodBreakdown(userId: string | mongoose.Types.ObjectId, year?: number, month?: number) {
    const { startDate, endDate } = getMonthDateRange(year, month);
    const uId = new mongoose.Types.ObjectId(userId.toString());

    const result = await Transaction.aggregate([
      {
        $match: {
          userId: uId,
          type: 'expense',
          paymentStatus: 'success',
          transactionDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$paymentMethod',
          totalPaise: { $sum: '$amountInPaise' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalPaise: -1 } },
    ]);

    const totalPaise = result.reduce((acc, curr) => acc + curr.totalPaise, 0);

    return result.map((item) => ({
      paymentMethod: item._id,
      amount: toRupees(item.totalPaise),
      count: item.count,
      percentage: totalPaise > 0 ? Math.round((item.totalPaise / totalPaise) * 100) : 0,
    }));
  }

  /**
   * Month-over-month comparison
   */
  async getMonthComparison(userId: string | mongoose.Types.ObjectId) {
    const now = new Date();
    const currentMonthRange = getMonthDateRange(now.getFullYear(), now.getMonth() + 1);
    
    // Previous month
    let prevYear = now.getFullYear();
    let prevMonth = now.getMonth();
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }
    const prevMonthRange = getMonthDateRange(prevYear, prevMonth);

    const [currentOverview, prevOverview] = await Promise.all([
      this.getOverview(userId, now.getFullYear(), now.getMonth() + 1),
      this.getOverview(userId, prevYear, prevMonth),
    ]);

    const expenseDiff = currentOverview.expense - prevOverview.expense;
    const expenseDiffPercent = prevOverview.expense > 0 ? Math.round((expenseDiff / prevOverview.expense) * 100) : 0;

    const incomeDiff = currentOverview.income - prevOverview.income;
    const incomeDiffPercent = prevOverview.income > 0 ? Math.round((incomeDiff / prevOverview.income) * 100) : 0;

    return {
      currentMonth: {
        ...currentOverview,
        label: now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      },
      previousMonth: {
        ...prevOverview,
        label: new Date(prevYear, prevMonth - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      },
      changes: {
        expenseDifference: expenseDiff,
        expenseDifferencePercentage: expenseDiffPercent,
        incomeDifference: incomeDiff,
        incomeDifferencePercentage: incomeDiffPercent,
      },
    };
  }

  /**
   * Top merchants by total spending
   */
  async getTopMerchants(userId: string | mongoose.Types.ObjectId, limit = 5) {
    const uId = new mongoose.Types.ObjectId(userId.toString());
    const result = await Transaction.aggregate([
      {
        $match: {
          userId: uId,
          type: 'expense',
          paymentStatus: 'success',
          merchant: { $ne: '' },
        },
      },
      {
        $group: {
          _id: '$merchant',
          totalPaise: { $sum: '$amountInPaise' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalPaise: -1 } },
      { $limit: limit },
    ]);

    return result.map((item) => ({
      merchant: item._id,
      amount: toRupees(item.totalPaise),
      transactionCount: item.count,
    }));
  }
}

export const analyticsService = new AnalyticsService();

