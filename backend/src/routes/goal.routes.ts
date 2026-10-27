import { Router } from 'express';
import { GoalController } from '../controllers/goal.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { createGoalSchema, contributeGoalSchema } from '../validators/goal.validators';

const router = Router();

router.use(authenticate);

router.get('/', GoalController.getGoals);
router.post('/', validate(createGoalSchema), GoalController.createGoal);
router.post('/:id/contributions', validate(contributeGoalSchema), GoalController.contributeGoal);
router.delete('/:id', GoalController.deleteGoal);

export default router;

