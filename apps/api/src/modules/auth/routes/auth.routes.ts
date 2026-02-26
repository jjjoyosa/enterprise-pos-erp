import { Router } from 'express';
import { registerTenant, login, refreshToken } from '../controllers/auth.controller';

const router = Router();

router.post('/register', registerTenant);
router.post('/login', login);
router.post('/refresh', refreshToken);

export default router;