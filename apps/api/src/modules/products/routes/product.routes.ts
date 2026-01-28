import { Router } from 'express';
import { createCategory, createProduct, getProducts } from '../controllers/product.controller';
import { requireAuth } from '../../../middleware/auth.middleware';

const router = Router();


router.use(requireAuth);


router.post('/categories', createCategory);
router.post('/', createProduct);
router.get('/', getProducts);

export default router;