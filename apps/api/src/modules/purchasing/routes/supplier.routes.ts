import { Router } from 'express';
import { getSuppliers, createSupplier, updateSupplier } from '../controllers/supplier.controller';
import { requireAuth } from '../../../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', getSuppliers);
router.post('/', createSupplier);
router.put('/:id', updateSupplier);

export default router;