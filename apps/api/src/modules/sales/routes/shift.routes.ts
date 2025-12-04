import { Router } from 'express';
import { openShift, getCurrentShift, closeShift } from '../controllers/shift.controller';

const router = Router();

router.post('/open', openShift);
router.get('/current', getCurrentShift);
router.post('/close', closeShift);

export default router;