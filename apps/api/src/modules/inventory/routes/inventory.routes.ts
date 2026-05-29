import { Router } from 'express';
import { 
  createWarehouse, 
  recordStockMovement, 
  getInventoryLevels, 
  getStockMovements,
  processSupplierReturn 
} from '../controllers/inventory.controller';
import { requireAuth } from '../../../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', getInventoryLevels);
router.get('/movements', getStockMovements);

router.post('/warehouses', createWarehouse);
router.post('/movements', recordStockMovement);
router.post('/returns', processSupplierReturn); 

export default router;