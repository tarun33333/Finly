import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import {
  createTransactionSchema,
  updateTransactionSchema,
  queryTransactionsSchema,
} from '../validators/transaction.validators';

const router = Router();

router.use(authenticate);

router.get('/', validate(queryTransactionsSchema), TransactionController.getTransactions);
router.post('/', validate(createTransactionSchema), TransactionController.createTransaction);
router.get('/summary', TransactionController.getSummary);
router.get('/:id', TransactionController.getTransactionById);
router.patch('/:id', validate(updateTransactionSchema), TransactionController.updateTransaction);
router.delete('/:id', TransactionController.deleteTransaction);

export default router;

