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
    
    const products = await Product.find({ 
      tenantId: req.tenantId, 
      isActive: { $ne: false } 
    })
    .populate('categoryId', 'name')
    .sort({ createdAt: -1 });
    
    res.status(200).json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: id, tenantId: req.tenantId }, 
      { isActive: false }, 
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found or unauthorized" });
    }

    res.status(200).json({ message: "Product successfully archived" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to archive product" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, basePrice, costPrice, trackInventory, categoryId } = req.body;

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: id, tenantId: req.tenantId },
      { name, basePrice, costPrice, trackInventory, categoryId },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(updatedProduct);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};


export const getCategories = async (req: Request, res: Response) => {
  try {
    console.log("Querying for tenantId:", req.tenantId); // ADD THIS
    const categories = await Category.find({ tenantId: req.tenantId }).sort({ name: 1 });
    console.log("Categories found:", categories); // ADD THIS
    res.status(200).json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};