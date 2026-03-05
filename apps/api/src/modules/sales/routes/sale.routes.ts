import { Router } from 'express';
import { processSale, getSales, processRefund } from '../controllers/sale.controller'; 
import { getDashboardMetrics } from '../controllers/analytics.controller'; 
import { requireAuth } from '../../../middleware/auth.middleware'; 

const router = Router();
router.use(requireAuth);

router.get('/analytics', getDashboardMetrics); 
router.post('/', processSale);
router.get('/', getSales);
router.post('/:id/refund', processRefund);

export default router;