import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { updateUserSchema } from '../validators/user.validators';

const router = Router();

router.use(authenticate);

router.get('/me', UserController.getProfile);
router.patch('/me', validate(updateUserSchema), UserController.updateProfile);
router.delete('/me', UserController.deleteAccount);
router.get('/me/preferences', UserController.getPreferences);
router.patch('/me/preferences', UserController.updatePreferences);

export default router;

