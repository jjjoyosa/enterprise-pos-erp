import { Router } from 'express';

import { processSale, getSales, getDashboardAnalytics } from '../controllers/sale.controller'; 
import { requireAuth } from '../../../middleware/auth.middleware'; 

const router = Router();
router.use(requireAuth);



router.get('/analytics', getDashboardAnalytics); 

router.post('/', processSale);
router.get('/', getSales);

export default router;