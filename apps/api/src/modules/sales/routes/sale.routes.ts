import { Router } from 'express';
import { processSale, getSales, processRefund } from '../controllers/sale.controller'; 
import { getDashboardMetrics, getABCAnalysis } from '../controllers/analytics.controller'; 
import { requireAuth } from '../../../middleware/auth.middleware'; 

const router = Router();
router.use(requireAuth);

router.get('/analytics', getDashboardMetrics); 
router.get('/abc-analysis', getABCAnalysis);
router.post('/', processSale);
router.get('/', getSales);
router.post('/:id/refund', processRefund);

export default router;