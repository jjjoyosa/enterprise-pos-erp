import { Router } from 'express';
import { 
  getEmployees, 
  createEmployee, 
  updateEmployee, 
  archiveEmployee,
  verifyManagerPin 
} from '../controllers/employee.controller';
import { requireAuth } from '../../../middleware/auth.middleware'; 

const router = Router();
router.use(requireAuth);

router.get('/', getEmployees);
router.post('/', createEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', archiveEmployee);


router.post('/verify-pin', verifyManagerPin); 

export default router;