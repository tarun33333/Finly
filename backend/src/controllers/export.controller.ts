import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { exportService } from '../services/export.service';
import { sendSuccess } from '../utils/response';

export class ExportController {
  static async exportCsv(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const csv = await exportService.exportCsv(req.user!._id);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=finly_transactions_${Date.now()}.csv`);
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }

  static async getMonthlyReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const year = req.query.year ? Number(req.query.year) : undefined;
      const month = req.query.month ? Number(req.query.month) : undefined;
      const report = await exportService.generateMonthlyReport(req.user!._id, year, month);
      sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  }
}

