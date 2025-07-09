import { Router } from 'express';
import { processSale } from '../controllers/sale.controller';

const router = Router();

router.post('/', processSale);

export default router;