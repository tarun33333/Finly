import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { authenticate } from '../middleware/authenticate';
import { upload } from '../middleware/uploadValidator';
import { aiLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import { createTransactionSchema } from '../validators/transaction.validators';

const router = Router();

router.use(authenticate);

// UPI Screenshot Upload & AI Extraction
router.post(
  '/upi-screenshot',
  aiLimiter,
  upload.single('screenshot'),
  UploadController.uploadUpiScreenshot
);

// Physical Bill/Receipt Upload & AI Extraction
router.post(
  '/receipt',
  aiLimiter,
  upload.single('receipt'),
  UploadController.uploadReceipt
);

// Human-confirmed transaction creation from upload
router.post(
  '/confirm-transaction',
  validate(createTransactionSchema),
  UploadController.confirmTransaction
);

export default router;

