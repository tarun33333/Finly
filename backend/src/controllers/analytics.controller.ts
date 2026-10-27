import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { analyticsService } from '../services/analytics.service';
import { sendSuccess } from '../utils/response';

export class AnalyticsController {
  static async getOverview(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const year = req.query.year ? Number(req.query.year) : undefined;
      const month = req.query.month ? Number(req.query.month) : undefined;
      const overview = await analyticsService.getOverview(req.user!._id, year, month);
      sendSuccess(res, overview);
    } catch (error) {
      next(error);
    }
  }

  static async getSpendingTrend(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const days = req.query.days ? Number(req.query.days) : 7;
      const trend = await analyticsService.getSpendingTrend(req.user!._id, days);
      sendSuccess(res, trend);
    } catch (error) {
      next(error);
    }
  }

  static async getCategoryBreakdown(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const year = req.query.year ? Number(req.query.year) : undefined;
      const month = req.query.month ? Number(req.query.month) : undefined;
      const breakdown = await analyticsService.getCategoryBreakdown(req.user!._id, year, month);
      sendSuccess(res, breakdown);
    } catch (error) {
      next(error);
    }
  }

  static async getPaymentMethods(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const year = req.query.year ? Number(req.query.year) : undefined;
      const month = req.query.month ? Number(req.query.month) : undefined;
      const methods = await analyticsService.getPaymentMethodBreakdown(req.user!._id, year, month);
      sendSuccess(res, methods);
    } catch (error) {
      next(error);
    }
  }

  static async getMonthComparison(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const comparison = await analyticsService.getMonthComparison(req.user!._id);
      sendSuccess(res, comparison);
    } catch (error) {
      next(error);
    }
  }

  static async getTopMerchants(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 5;
      const merchants = await analyticsService.getTopMerchants(req.user!._id, limit);
      sendSuccess(res, merchants);
    } catch (error) {
      next(error);
    }
  }
}

