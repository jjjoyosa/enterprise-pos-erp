import { Router } from 'express';
import { registerTenant, login } from '../controllers/auth.controller';

const router = Router();

router.post('/register', registerTenant);
router.post('/login', login);

export default router;