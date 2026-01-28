import { Router } from 'express';

import { processSale, getSales } from '../controllers/sale.controller'; 
import { requireAuth } from '../../../middleware/auth.middleware'; 

const router = Router();


router.use(requireAuth);

router.post('/', processSale);


router.get('/', getSales);

export default router;