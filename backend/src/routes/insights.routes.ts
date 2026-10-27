import { Router } from 'express';
import { InsightsController } from '../controllers/insights.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.get('/', InsightsController.getInsights);
router.post('/generate', InsightsController.generateInsights);
router.patch('/:id/dismiss', InsightsController.dismissInsight);
router.post('/:id/feedback', InsightsController.submitFeedback);

export default router;

