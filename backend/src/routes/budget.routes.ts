import { Router } from 'express';
import { BudgetController } from '../controllers/budget.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { createBudgetSchema, updateBudgetSchema } from '../validators/budget.validators';

const router = Router();

router.use(authenticate);

router.get('/', BudgetController.getBudgets);
router.post('/', validate(createBudgetSchema), BudgetController.createBudget);
router.get('/:id', BudgetController.getBudgetById);
router.patch('/:id', validate(updateBudgetSchema), BudgetController.updateBudget);
router.delete('/:id', BudgetController.deleteBudget);
router.get('/:id/progress', BudgetController.getBudgetProgress);

export default router;

