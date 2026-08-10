import { Router } from 'express';
import { updateProfile } from '../controllers/userController.js';
import { updatePassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);
router.put('/profile', updateProfile);
router.put('/password', updatePassword);

export default router;
