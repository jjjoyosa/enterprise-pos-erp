import { Router } from 'express';
import { processSale } from '../controllers/sale.controller';
import { syncOfflineSales } from '../controllers/sync.controller';

const router = Router();


router.post('/', processSale);


router.post('/sync', syncOfflineSales);

export default router;