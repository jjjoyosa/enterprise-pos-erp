import { Router } from 'express';
import { openShift, closeShift, getCurrentShift } from '../controllers/shift.controller';
import { requireAuth } from '../../../middleware/auth.middleware'; 

const router = Router();


router.use(requireAuth); 

router.post('/open', openShift);
router.post('/close', closeShift);
router.get('/current', getCurrentShift);

export default router;