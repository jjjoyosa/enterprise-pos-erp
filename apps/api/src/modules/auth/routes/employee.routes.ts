import { Router } from 'express';
import { getEmployees, updateEmployee, archiveEmployee, createEmployee } from '../controllers/employee.controller';
import { requireAuth } from '../../../middleware/auth.middleware'; // Adjust to your auth middleware

const router = Router();

// Protect all employee routes with authentication middleware
router.use(requireAuth);

router.get('/', getEmployees);
router.post('/', createEmployee);
// Add these to your router
router.patch('/:id', requireAuth, updateEmployee); // For Edits
router.delete('/:id', requireAuth, archiveEmployee); // For Soft Deletes

export default router;