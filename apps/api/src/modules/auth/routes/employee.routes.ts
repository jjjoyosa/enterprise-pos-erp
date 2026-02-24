import { Router } from 'express';
import { getEmployees, createEmployee } from '../controllers/employee.controller';
import { requireAuth } from '../../../middleware/auth.middleware'; // Adjust to your auth middleware

const router = Router();

// Protect all employee routes with authentication middleware
router.use(requireAuth);

router.get('/', getEmployees);
router.post('/', createEmployee);

export default router;