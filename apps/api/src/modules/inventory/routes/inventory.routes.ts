import { Router } from 'express';
import { createWarehouse, recordStockMovement } from '../controllers/inventory.controller';

const router = Router();

router.post('/warehouses', createWarehouse);
router.post('/movements', recordStockMovement);

export default router;