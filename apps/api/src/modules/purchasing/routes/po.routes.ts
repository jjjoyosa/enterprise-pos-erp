import { Router } from 'express';
import { getPOs, createPO, updatePOStatus } from '../controllers/po.controller';
import { requireAuth } from '../../../middleware/auth.middleware';

const router = Router();
router.use(requireAuth);

router.get('/', getPOs);
router.post('/', createPO);
router.patch('/:id/status', updatePOStatus);

export default router;