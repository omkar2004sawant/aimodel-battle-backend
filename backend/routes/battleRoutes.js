import { Router } from 'express';
import { createBattle, getStats } from '../controllers/battleController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', protect, createBattle);
router.get('/stats', protect, getStats);

export default router;
