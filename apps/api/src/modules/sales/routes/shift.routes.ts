import { Router } from 'express';
import { openShift, getCurrentShift, closeShift, recordCashMovement, addCashMovement } from '../controllers/shift.controller';
import { requireAuth } from '../../../middleware/auth.middleware'; 

const router = Router();


router.use(requireAuth);

router.get('/current', getCurrentShift);
router.post('/open', openShift);
router.post('/close', closeShift);
router.post('/cash-movement', recordCashMovement); 
router.post('/:id/cash-movement', addCashMovement);

export default router;