import { Router } from 'express';
import { createDiscount, getActiveDiscounts } from '../controllers/discount.controller';
import { requireAuth } from '../../../middleware/auth.middleware'; 

const router = Router();

router.use(requireAuth);

router.post('/', createDiscount);
router.get('/active', getActiveDiscounts);

export default router;