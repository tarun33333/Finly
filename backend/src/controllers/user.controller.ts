import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { User } from '../models/User';
import { Transaction } from '../models/Transaction';
import { Category } from '../models/Category';
import { Budget } from '../models/Budget';
import { Goal } from '../models/Goal';
import { Insight } from '../models/Insight';
import { RefreshToken } from '../models/RefreshToken';
import { Notification } from '../models/Notification';
import { sendSuccess } from '../utils/response';

export class UserController {
  static async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      sendSuccess(res, req.user);
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const {
        name,
        currency,
        themePreference,
        monthlyIncomeTarget,
        monthlySpendingTarget,
        preferences,
        onboardingCompleted,
      } = req.body;

      if (name !== undefined) user.name = name;
      if (currency !== undefined) user.currency = currency;
      if (themePreference !== undefined) user.themePreference = themePreference;
      if (monthlyIncomeTarget !== undefined) user.monthlyIncomeTarget = monthlyIncomeTarget;
      if (monthlySpendingTarget !== undefined) user.monthlySpendingTarget = monthlySpendingTarget;
      if (preferences !== undefined) {
        user.preferences = { ...user.preferences, ...preferences };
      }
      if (onboardingCompleted !== undefined) user.onboardingCompleted = onboardingCompleted;

      await user.save();
      sendSuccess(res, user, 'Profile updated successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async getPreferences(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      sendSuccess(res, req.user!.preferences);
    } catch (error) {
      next(error);
    }
  }

  static async updatePreferences(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      user.preferences = { ...user.preferences, ...req.body };
      await user.save();
      sendSuccess(res, user.preferences, 'Preferences updated successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async deleteAccount(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id;

      // Cascade delete all user financial data and sessions
      await Promise.all([
        Transaction.deleteMany({ userId }),
        Category.deleteMany({ userId }),
        Budget.deleteMany({ userId }),
        Goal.deleteMany({ userId }),
        Insight.deleteMany({ userId }),
        RefreshToken.deleteMany({ userId }),
        Notification.deleteMany({ userId }),
        User.deleteOne({ _id: userId }),
      ]);

      sendSuccess(res, { deleted: true }, 'Your account and all associated data have been permanently deleted.');
    } catch (error) {
      next(error);
    }
  }
}

