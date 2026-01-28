import { Router } from 'express';

import { processSale } from '../controllers/sale.controller'; 
import { requireAuth } from '../../../middleware/auth.middleware'; 

const router = Router();


router.use(requireAuth);


router.post('/', processSale);

export default router;