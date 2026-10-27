import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { goalService } from '../services/goal.service';
import { sendSuccess } from '../utils/response';

export class GoalController {
  static async getGoals(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const goals = await goalService.getGoals(req.user!._id);
      sendSuccess(res, goals);
    } catch (error) {
      next(error);
    }
  }

  static async createGoal(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const goal = await goalService.createGoal({
        userId: req.user!._id,
        ...req.body,
      });
      sendSuccess(res, goal, 'Savings goal created successfully.', 201);
    } catch (error) {
      next(error);
    }
  }

  static async contributeGoal(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { amount, notes } = req.body;
      const goal = await goalService.addContribution(req.user!._id, req.params.id as string, amount, notes);
      sendSuccess(res, goal, 'Contribution added successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async deleteGoal(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await goalService.deleteGoal(req.user!._id, req.params.id as string);
      sendSuccess(res, { deleted: true }, 'Goal deleted successfully.');
    } catch (error) {
      next(error);
    }
  }
}
