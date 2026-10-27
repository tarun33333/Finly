import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { budgetService } from '../services/budget.service';
import { sendSuccess } from '../utils/response';

export class BudgetController {
  static async getBudgets(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const budgets = await budgetService.getBudgets(req.user!._id);
      sendSuccess(res, budgets);
    } catch (error) {
      next(error);
    }
  }

  static async getBudgetById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const budget = await budgetService.getBudgetById(req.user!._id, req.params.id as string);
      sendSuccess(res, budget);
    } catch (error) {
      next(error);
    }
  }

  static async createBudget(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const budget = await budgetService.createBudget({
        userId: req.user!._id,
        ...req.body,
      });
      sendSuccess(res, budget, 'Budget created successfully.', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateBudget(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const budget = await budgetService.updateBudget(req.user!._id, req.params.id as string, req.body);
      sendSuccess(res, budget, 'Budget updated successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async deleteBudget(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await budgetService.deleteBudget(req.user!._id, req.params.id as string);
      sendSuccess(res, { deleted: true }, 'Budget deleted successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async getBudgetProgress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const budget = await budgetService.getBudgetById(req.user!._id, req.params.id as string);
      sendSuccess(res, budget.progress);
    } catch (error) {
      next(error);
    }
  }
}
