import { Router } from 'express';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../controllers/customer.controller';
import { requireAuth } from '../../../middleware/auth.middleware'; 

const router = Router();


router.use(requireAuth); 

router.get('/', getCustomers);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

export default router;