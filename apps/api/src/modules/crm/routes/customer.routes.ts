import { Router } from 'express';
import { createCustomer, getCustomers } from '../controllers/customer.controller';
import { requireAuth } from '../../../middleware/auth.middleware'; 

const router = Router();
router.use(requireAuth);
router.post('/', createCustomer);
router.get('/', getCustomers);
export default router;