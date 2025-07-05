import { Router } from 'express';
import { createCategory, createProduct } from '../controllers/product.controller';

const router = Router();

router.post('/categories', createCategory);
router.post('/', createProduct);

export default router;