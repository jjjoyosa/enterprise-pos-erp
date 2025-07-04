import { Router } from 'express';
import { registerTenant } from '../controllers/auth.controller';

const router = Router();

router.post('/register', registerTenant);

export default router;