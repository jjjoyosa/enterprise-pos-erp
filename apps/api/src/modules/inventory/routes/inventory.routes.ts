import { Router } from 'express';
import { createWarehouse, recordStockMovement } from '../controllers/inventory.controller';
import { requireAuth } from '../../../middleware/auth.middleware';

const router = Router();


router.use(requireAuth);

router.post('/warehouses', createWarehouse);
router.post('/movements', recordStockMovement);

export default router;