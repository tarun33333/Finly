import mongoose from 'mongoose';
import { Transaction } from '../models/Transaction';
import { ICategory } from '../models/Category';
import { analyticsService } from './analytics.service';
import { formatIndianDate } from '../utils/date';

class ExportService {
  /**
   * Generate CSV format string of user's transactions
   */
  async exportCsv(userId: string | mongoose.Types.ObjectId): Promise<string> {
    const transactions = await Transaction.find({ userId })
      .populate<{ categoryId: ICategory }>('categoryId')
      .sort({ transactionDate: -1 });

    const headers = [
      'Transaction ID',
      'Date (IST)',
      'Type',
      'Category',
      'Merchant / Payee',
      'Amount (INR)',
      'Payment Method',
      'Status',
      'UPI / Reference ID',
      'Description',
      'Notes',
    ];

    const rows = transactions.map((t) => [
      t._id.toString(),
      formatIndianDate(t.transactionDate),
      t.type.toUpperCase(),
      t.categoryId?.name || 'Uncategorized',
      `"${(t.merchant || '').replace(/"/g, '""')}"`,
      t.amount.toFixed(2),
      t.paymentMethod,
      t.paymentStatus,
      t.referenceId || '',
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    return csvContent;
  }

  /**
   * Generate monthly summary report data
   */
  async generateMonthlyReport(userId: string | mongoose.Types.ObjectId, year?: number, month?: number) {
    const [overview, categoryBreakdown, paymentBreakdown, topMerchants] = await Promise.all([
      analyticsService.getOverview(userId, year, month),
      analyticsService.getCategoryBreakdown(userId, year, month),
      analyticsService.getPaymentMethodBreakdown(userId, year, month),
      analyticsService.getTopMerchants(userId, 5),
    ]);

    return {
      reportTitle: `Finly Monthly Financial Statement`,
      currency: 'INR',
      overview,
      categoryBreakdown,
      paymentBreakdown,
      topMerchants,
      generatedAt: new Date().toISOString(),
    };
  }
}

export const exportService = new ExportService();

