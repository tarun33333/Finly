import { Router } from 'express';
import { ExportController } from '../controllers/export.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.get('/transactions.csv', ExportController.exportCsv);
router.get('/monthly-report', ExportController.getMonthlyReport);

export default router;

