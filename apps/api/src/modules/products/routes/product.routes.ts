import { Router } from 'express';
import { createCategory, createProduct, getProducts } from '../controllers/product.controller';

const router = Router();

router.post('/categories', createCategory);
router.post('/', createProduct);
router.get('/', getProducts); 

export default router;