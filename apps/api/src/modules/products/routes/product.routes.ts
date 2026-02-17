
import { Router } from 'express';
import { 
  createCategory, 
  createProduct, 
  getProducts, 
  deleteProduct, 
  updateProduct, 
  getCategories 
} from '../controllers/product.controller';
import { requireAuth } from '../../../middleware/auth.middleware';

const router = Router();


router.use(requireAuth);


router.get('/categories', getCategories);
router.post('/categories', createCategory);


router.delete('/:id', deleteProduct);
router.patch('/:id', updateProduct);


router.get('/', getProducts);
router.post('/', createProduct);

export default router;