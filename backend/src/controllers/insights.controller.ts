import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { insightsService } from '../services/insights.service';
import { sendSuccess } from '../utils/response';

export class InsightsController {
  static async getInsights(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const insights = await insightsService.getInsights(req.user!._id);
      sendSuccess(res, insights);
    } catch (error) {
      next(error);
    }
  }

  static async generateInsights(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const insights = await insightsService.generateInsights(req.user!._id);
      sendSuccess(res, insights, 'Insights refreshed successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async dismissInsight(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await insightsService.dismissInsight(req.user!._id, req.params.id as string);
      sendSuccess(res, { dismissed: true }, 'Insight dismissed.');
    } catch (error) {
      next(error);
    }
  }

  static async submitFeedback(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { feedback } = req.body;
      await insightsService.submitFeedback(req.user!._id, req.params.id as string, feedback);
      sendSuccess(res, { submitted: true }, 'Thank you for your feedback.');
    } catch (error) {
      next(error);
    }
  }
}
