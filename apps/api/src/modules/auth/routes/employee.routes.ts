import { Router } from 'express';
import { getEmployees, updateEmployee, archiveEmployee, createEmployee } from '../controllers/employee.controller';
import { requireAuth } from '../../../middleware/auth.middleware'; 

const router = Router();


router.use(requireAuth);

router.get('/', getEmployees);
router.post('/', createEmployee);

router.patch('/:id', requireAuth, updateEmployee); 
router.delete('/:id', requireAuth, archiveEmployee); 

export default router;