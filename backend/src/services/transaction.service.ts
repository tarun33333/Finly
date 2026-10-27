import mongoose from 'mongoose';
import { Transaction, ITransaction, TransactionType, PaymentMethod, PaymentStatus, TransactionSource } from '../models/Transaction';
import { Category } from '../models/Category';
import { toPaise, toRupees } from '../utils/currency';
import { AppError } from '../middleware/errorHandler';

export interface CreateTransactionDTO {
  userId: string | mongoose.Types.ObjectId;
  type: TransactionType;
  amount: number;
  currency?: string;
  categoryId: string | mongoose.Types.ObjectId;
  description?: string;
  merchant?: string;
  transactionDate: Date | string;
  transactionTime?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  source?: TransactionSource;
  attachmentUrl?: string;
  attachmentPath?: string;
  referenceId?: string;
  extractionConfidence?: number;
  userConfirmed?: boolean;
  notes?: string;
  isRecurring?: boolean;
}

export interface QueryTransactionsDTO {
  userId: string | mongoose.Types.ObjectId;
  page?: number;
  limit?: number;
  type?: TransactionType;
  categoryId?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: 'transactionDate' | 'amount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

class TransactionService {
  /**
   * Check for potential duplicate transactions
   */
  async checkDuplicate(
    userId: string | mongoose.Types.ObjectId,
    amount: number,
    transactionDate: Date | string,
    referenceId?: string | null,
    merchant?: string
  ): Promise<{ isDuplicate: boolean; duplicateReason?: string; existingTxnId?: string }> {
    // 1. If referenceId is provided (e.g. UPI UTR number), check exact match
    if (referenceId && referenceId.trim().length > 4) {
      const match = await Transaction.findOne({
        userId,
        referenceId: referenceId.trim(),
      });
      if (match) {
        return {
          isDuplicate: true,
          duplicateReason: `A transaction with UPI/Bank Reference ID "${referenceId}" has already been recorded.`,
          existingTxnId: match._id.toString(),
        };
      }
    }

    // 2. Similarity window: same user, same amount, same merchant, within +/- 24 hours
    const targetDate = new Date(transactionDate);
    const windowStart = new Date(targetDate.getTime() - 24 * 60 * 60 * 1000);
    const windowEnd = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);
    const amountInPaise = toPaise(amount);

    const query: any = {
      userId,
      amountInPaise,
      transactionDate: { $gte: windowStart, $lte: windowEnd },
    };

    if (merchant && merchant.trim().length > 1) {
      query.merchant = { $regex: new RegExp(`^${merchant.trim()}$`, 'i') };
    }

    const possibleMatch = await Transaction.findOne(query);
    if (possibleMatch) {
      return {
        isDuplicate: true,
        duplicateReason: `A similar transaction of ₹${amount} with "${merchant || 'same amount'}" exists on ${targetDate.toLocaleDateString('en-IN')}.`,
        existingTxnId: possibleMatch._id.toString(),
      };
    }

    return { isDuplicate: false };
  }

  /**
   * Create a new transaction
   */
  async createTransaction(dto: CreateTransactionDTO): Promise<ITransaction> {
    const category = await Category.findOne({
      _id: dto.categoryId,
      $or: [{ userId: dto.userId }, { userId: null, isDefault: true }],
    });

    if (!category) {
      throw new AppError('Invalid category selected.', 400, 'INVALID_CATEGORY');
    }

    const amountInPaise = toPaise(dto.amount);
    const txn = await Transaction.create({
      userId: dto.userId,
      type: dto.type,
      amount: dto.amount,
      amountInPaise,
      currency: dto.currency || 'INR',
      categoryId: category._id,
      description: dto.description || '',
      merchant: dto.merchant || '',
      transactionDate: new Date(dto.transactionDate),
      transactionTime: dto.transactionTime,
      paymentMethod: dto.paymentMethod || 'UPI',
      paymentStatus: dto.paymentStatus || 'success',
      source: dto.source || 'manual',
      attachmentUrl: dto.attachmentUrl,
      attachmentPath: dto.attachmentPath,
      referenceId: dto.referenceId,
      extractionConfidence: dto.extractionConfidence,
      userConfirmed: dto.userConfirmed ?? true,
      notes: dto.notes,
      isRecurring: dto.isRecurring || false,
    });

    return (await txn.populate('categoryId')) as ITransaction;
  }

  /**
   * Query transactions with pagination, filters, and search
   */
  async queryTransactions(params: QueryTransactionsDTO) {
    const {
      userId,
      page = 1,
      limit = 20,
      type,
      categoryId,
      paymentMethod,
      paymentStatus,
      startDate,
      endDate,
      search,
      sortBy = 'transactionDate',
      sortOrder = 'desc',
    } = params;

    const filter: any = { userId };

    if (type) filter.type = type;
    if (categoryId) filter.categoryId = categoryId;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    if (startDate || endDate) {
      filter.transactionDate = {};
      if (startDate) filter.transactionDate.$gte = new Date(startDate);
      if (endDate) filter.transactionDate.$lte = new Date(endDate);
    }

    if (search) {
      filter.$or = [
        { merchant: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { referenceId: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOption: any = {};
    sortOption[sortBy] = sortOrder === 'asc' ? 1 : -1;
    if (sortBy !== 'createdAt') {
      sortOption.createdAt = -1;
    }

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('categoryId')
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(filter),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single transaction by ID with user ownership check
   */
  async getTransactionById(userId: string | mongoose.Types.ObjectId, id: string): Promise<ITransaction> {
    const txn = await Transaction.findOne({ _id: id, userId }).populate('categoryId');
    if (!txn) {
      throw new AppError('Transaction not found.', 404, 'NOT_FOUND');
    }
    return txn;
  }

  /**
   * Update transaction
   */
  async updateTransaction(
    userId: string | mongoose.Types.ObjectId,
    id: string,
    updates: Partial<CreateTransactionDTO>
  ): Promise<ITransaction> {
    const txn = await Transaction.findOne({ _id: id, userId });
    if (!txn) {
      throw new AppError('Transaction not found.', 404, 'NOT_FOUND');
    }

    if (updates.categoryId) {
      const category = await Category.findOne({
        _id: updates.categoryId,
        $or: [{ userId }, { userId: null, isDefault: true }],
      });
      if (!category) {
        throw new AppError('Invalid category.', 400, 'INVALID_CATEGORY');
      }
      txn.categoryId = category._id as mongoose.Types.ObjectId;
    }

    if (updates.amount !== undefined) {
      txn.amount = updates.amount;
      txn.amountInPaise = toPaise(updates.amount);
    }
    if (updates.type) txn.type = updates.type;
    if (updates.currency) txn.currency = updates.currency;
    if (updates.description !== undefined) txn.description = updates.description;
    if (updates.merchant !== undefined) txn.merchant = updates.merchant;
    if (updates.transactionDate) txn.transactionDate = new Date(updates.transactionDate);
    if (updates.transactionTime !== undefined) txn.transactionTime = updates.transactionTime;
    if (updates.paymentMethod) txn.paymentMethod = updates.paymentMethod;
    if (updates.paymentStatus) txn.paymentStatus = updates.paymentStatus;
    if (updates.notes !== undefined) txn.notes = updates.notes;
    if (updates.isRecurring !== undefined) txn.isRecurring = updates.isRecurring;

    await txn.save();
    return (await txn.populate('categoryId')) as ITransaction;
  }

  /**
   * Delete transaction
   */
  async deleteTransaction(userId: string | mongoose.Types.ObjectId, id: string): Promise<void> {
    const result = await Transaction.deleteOne({ _id: id, userId });
    if (result.deletedCount === 0) {
      throw new AppError('Transaction not found.', 404, 'NOT_FOUND');
    }
  }

  /**
   * Get financial summary (Income, Expense, Net Flow, Balance) for date range or all-time
   */
  async getSummary(userId: string | mongoose.Types.ObjectId, startDate?: Date, endDate?: Date) {
    const dateMatch: any = {};
    if (startDate) dateMatch.$gte = startDate;
    if (endDate) dateMatch.$lte = endDate;

    const matchStage: any = {
      userId: new mongoose.Types.ObjectId(userId.toString()),
      paymentStatus: 'success', // Exclude failed and pending
    };

    if (startDate || endDate) {
      matchStage.transactionDate = dateMatch;
    }

    const result = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          totalPaise: { $sum: '$amountInPaise' },
          count: { $sum: 1 },
        },
      },
    ]);

    let totalIncomePaise = 0;
    let totalExpensePaise = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    for (const item of result) {
      if (item._id === 'income') {
        totalIncomePaise = item.totalPaise;
        incomeCount = item.count;
      } else if (item._id === 'expense') {
        totalExpensePaise = item.totalPaise;
        expenseCount = item.count;
      }
    }

    // All-time balance computation
    const allTimeResult = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId.toString()),
          paymentStatus: 'success',
        },
      },
      {
        $group: {
          _id: '$type',
          totalPaise: { $sum: '$amountInPaise' },
        },
      },
    ]);

    let allTimeIncomePaise = 0;
    let allTimeExpensePaise = 0;
    for (const item of allTimeResult) {
      if (item._id === 'income') allTimeIncomePaise = item.totalPaise;
      if (item._id === 'expense') allTimeExpensePaise = item.totalPaise;
    }

    const netFlowPaise = totalIncomePaise - totalExpensePaise;
    const balancePaise = allTimeIncomePaise - allTimeExpensePaise;

    return {
      periodIncome: toRupees(totalIncomePaise),
      periodExpense: toRupees(totalExpensePaise),
      netFlow: toRupees(netFlowPaise),
      estimatedBalance: toRupees(balancePaise),
      currency: 'INR',
      incomeCount,
      expenseCount,
      isEstimatedBalance: true, // Finly explicitly discloses this is tracked estimated balance
    };
  }
}

export const transactionService = new TransactionService();

