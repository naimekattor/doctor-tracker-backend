import { Router } from 'express';
import { getDashboardStats } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { analyticsLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

router.get('/', protect, analyticsLimiter, getDashboardStats);

export default router;
