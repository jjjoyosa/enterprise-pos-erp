import { Request, Response } from 'express';
import Category from '../models/Category';
import Product from '../models/Product';
import { generateSKU } from '../../../utils/skuGenerator';

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const category = await Category.create({ tenantId: req.tenantId, name, description });
    res.status(201).json({ message: 'Category created', category });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { categoryId, name, description, sku, basePrice, costPrice, trackInventory } = req.body;
    const finalSKU = sku || generateSKU(name);
    const product = await Product.create({
      tenantId: req.tenantId,
      categoryId,
      name,
      description,
      sku: finalSKU,
      basePrice,
      costPrice,
      trackInventory
    });
    res.status(201).json({ message: 'Product created', product });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};


export const getProducts = async (req: Request, res: Response) => {
  try {
    
    const products = await Product.find({ tenantId: req.tenantId })
                                  .populate('categoryId', 'name')
                                  .sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};