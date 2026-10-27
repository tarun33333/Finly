import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { geminiService } from '../services/gemini.service';
import { categorizationService } from '../services/categorization.service';
import { transactionService } from '../services/transaction.service';
import { sendSuccess } from '../utils/response';
import { AppError } from '../middleware/errorHandler';

export class UploadController {
  static async uploadUpiScreenshot(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw new AppError('No screenshot file uploaded.', 400, 'NO_FILE_UPLOADED');
      }

      const filePath = req.file.path;
      const mimeType = req.file.mimetype;

      // Extract transaction data using Gemini Vision
      const extracted = await geminiService.extractUpiScreenshot(filePath, mimeType);

      // Categorize using rules + past user behavior
      const suggestedCategory = await categorizationService.suggestCategory(
        req.user!._id,
        extracted.merchant,
        extracted.description,
        extracted.transactionType
      );

      // Duplicate check
      const duplicateCheck = await transactionService.checkDuplicate(
        req.user!._id,
        extracted.amount,
        extracted.transactionDate,
        extracted.referenceId,
        extracted.merchant
      );

      sendSuccess(res, {
        extracted: {
          ...extracted,
          categoryId: suggestedCategory.categoryId,
          categoryName: suggestedCategory.categoryName,
        },
        duplicateCheck,
        attachmentPath: req.file.filename,
      }, 'Screenshot analyzed successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async uploadReceipt(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw new AppError('No receipt file uploaded.', 400, 'NO_FILE_UPLOADED');
      }

      const filePath = req.file.path;
      const mimeType = req.file.mimetype;

      const extracted = await geminiService.extractReceipt(filePath, mimeType);

      const suggestedCategory = await categorizationService.suggestCategory(
        req.user!._id,
        extracted.merchant,
        extracted.description,
        'expense'
      );

      const duplicateCheck = await transactionService.checkDuplicate(
        req.user!._id,
        extracted.amount,
        extracted.transactionDate,
        null,
        extracted.merchant
      );

      sendSuccess(res, {
        extracted: {
          ...extracted,
          categoryId: suggestedCategory.categoryId,
          categoryName: suggestedCategory.categoryName,
        },
        duplicateCheck,
        attachmentPath: req.file.filename,
      }, 'Receipt analyzed successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async confirmTransaction(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const txn = await transactionService.createTransaction({
        userId: req.user!._id,
        ...req.body,
        userConfirmed: true,
      });

      sendSuccess(res, txn, 'Transaction confirmed and saved successfully.', 201);
    } catch (error) {
      next(error);
    }
  }
}

