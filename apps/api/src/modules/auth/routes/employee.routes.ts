import { Router } from 'express';
import { getEmployees, updateEmployee, archiveEmployee, createEmployee } from '../controllers/employee.controller';
import { requireAuth } from '../../../middleware/auth.middleware'; 

const router = Router();


router.use(requireAuth);

router.get('/', getEmployees);
router.post('/', createEmployee);


router.put('/:id', updateEmployee); 
router.delete('/:id', archiveEmployee); 

export default router;