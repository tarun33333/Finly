import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { Category } from '../models/Category';
import { sendSuccess } from '../utils/response';
import { AppError } from '../middleware/errorHandler';

export class CategoryController {
  static async getCategories(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type } = req.query;
      const filter: any = {
        $or: [{ userId: req.user!._id }, { userId: null, isDefault: true }],
        isActive: true,
      };
      if (type) filter.type = type;

      const categories = await Category.find(filter).sort({ isDefault: -1, name: 1 });
      sendSuccess(res, categories);
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, type, icon, color } = req.body;
      const category = await Category.create({
        userId: req.user!._id,
        name: name.trim(),
        type,
        icon: icon || 'Tag',
        color: color || '#635BFF',
        isDefault: false,
        isActive: true,
      });

      sendSuccess(res, category, 'Category created successfully.', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await Category.findOne({
        _id: req.params.id,
        userId: req.user!._id, // Cannot edit global system defaults
      });

      if (!category) {
        throw new AppError('Category not found or cannot be modified.', 404, 'NOT_FOUND');
      }

      if (req.body.name) category.name = req.body.name.trim();
      if (req.body.icon) category.icon = req.body.icon;
      if (req.body.color) category.color = req.body.color;
      if (req.body.isActive !== undefined) category.isActive = req.body.isActive;

      await category.save();
      sendSuccess(res, category, 'Category updated successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await Category.findOne({
        _id: req.params.id,
        userId: req.user!._id,
      });

      if (!category) {
        throw new AppError('Category not found or default category cannot be deleted.', 404, 'NOT_FOUND');
      }

      category.isActive = false; // Soft-delete to preserve transaction history
      await category.save();

      sendSuccess(res, { deleted: true }, 'Category removed successfully.');
    } catch (error) {
      next(error);
    }
  }
}

