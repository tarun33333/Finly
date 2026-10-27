import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.get('/overview', AnalyticsController.getOverview);
router.get('/spending-trend', AnalyticsController.getSpendingTrend);
router.get('/category-breakdown', AnalyticsController.getCategoryBreakdown);
router.get('/payment-methods', AnalyticsController.getPaymentMethods);
router.get('/month-comparison', AnalyticsController.getMonthComparison);
router.get('/top-merchants', AnalyticsController.getTopMerchants);

export default router;

