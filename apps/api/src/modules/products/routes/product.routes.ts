import { Router } from 'express';
import { 
  createCategory, 
  createProduct, 
  getProducts, 
  deleteProduct, 
  updateProduct, 
  getCategories,
  getRecipe,       
  upsertRecipe     
} from '../controllers/product.controller';
import { requireAuth } from '../../../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);


router.get('/categories', getCategories);
router.post('/categories', createCategory);


router.get('/', getProducts);
router.post('/', createProduct);


router.get('/:productId/recipe', getRecipe);
router.post('/:productId/recipe', upsertRecipe);


router.delete('/:id', deleteProduct);
router.patch('/:id', updateProduct);

export default router;