import { Router } from 'express';
import { getDashboardMetrics } from '../controllers/analytics.controller';

const router = Router();

router.get('/dashboard', getDashboardMetrics);

export default router;