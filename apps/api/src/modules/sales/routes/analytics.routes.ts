import { Router } from 'express';
import { getDashboardMetrics } from '../controllers/analytics.controller';

const router = Router();

router.get('/dashboard', getDashboardMetrics);
router.get('/analytics', getDashboardMetrics);
router.get('/low-stock', getDashboardMetrics);
export default router;