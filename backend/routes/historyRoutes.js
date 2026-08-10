import { Router } from 'express';
import { getHistory, getBattle, deleteBattle, clearHistory } from '../controllers/historyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);
router.get('/', getHistory);
router.get('/:id', getBattle);
router.delete('/:id', deleteBattle);
router.delete('/', clearHistory);

export default router;
