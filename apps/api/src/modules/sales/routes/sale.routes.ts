import { Router } from 'express';
// Imported processRefund here
import { processSale, getSales, getDashboardAnalytics, processRefund } from '../controllers/sale.controller'; 
import { requireAuth } from '../../../middleware/auth.middleware'; 

const router = Router();

router.use(requireAuth);

router.get('/analytics', getDashboardAnalytics); 
router.post('/', processSale);
router.get('/', getSales);

// ADDED REFUND ROUTE HERE
router.post('/:id/refund', processRefund);

export default router;