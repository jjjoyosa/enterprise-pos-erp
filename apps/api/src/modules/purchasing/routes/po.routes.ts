import { Router } from 'express';
import { getPOs, createPO, updatePOStatus } from '../controllers/po.controller';
import { requireAuth } from '../../../middleware/auth.middleware';
import { receivePurchaseOrder } from '../controllers/receiving.controller';

const router = Router();
router.use(requireAuth);

router.get('/', getPOs);
router.post('/', createPO);
router.patch('/:id/status', updatePOStatus);
router.post('/:id/receive', receivePurchaseOrder);

export default router;