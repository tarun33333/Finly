import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { transactionService } from '../services/transaction.service';
import { sendSuccess } from '../utils/response';

export class TransactionController {
  static async getTransactions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await transactionService.queryTransactions({
        userId: req.user!._id,
        ...req.query,
      });
      sendSuccess(res, result.transactions, undefined, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getTransactionById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const txn = await transactionService.getTransactionById(req.user!._id, req.params.id as string);
      sendSuccess(res, txn);
    } catch (error) {
      next(error);
    }
  }

  static async createTransaction(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check for duplicate warning before saving
      const { amount, transactionDate, referenceId, merchant, allowDuplicate } = req.body;
      if (!allowDuplicate) {
        const duplicateCheck = await transactionService.checkDuplicate(
          req.user!._id,
          amount,
          transactionDate,
          referenceId,
          merchant
        );
        if (duplicateCheck.isDuplicate) {
          res.status(200).json({
            success: true,
            isDuplicateWarning: true,
            message: duplicateCheck.duplicateReason,
            existingTxnId: duplicateCheck.existingTxnId,
          });
          return;
        }
      }

      const txn = await transactionService.createTransaction({
        userId: req.user!._id,
        ...req.body,
      });
      sendSuccess(res, txn, 'Transaction saved successfully.', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateTransaction(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const txn = await transactionService.updateTransaction(req.user!._id, req.params.id as string, req.body);
      sendSuccess(res, txn, 'Transaction updated successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async deleteTransaction(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await transactionService.deleteTransaction(req.user!._id, req.params.id as string);
      sendSuccess(res, { deleted: true }, 'Transaction deleted successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async getSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      const summary = await transactionService.getSummary(req.user!._id, start, end);
      sendSuccess(res, summary);
    } catch (error) {
      next(error);
    }
  }
}
