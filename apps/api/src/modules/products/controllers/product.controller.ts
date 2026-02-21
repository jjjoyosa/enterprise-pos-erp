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
    // 🚨 THE SECURITY LOCK: Ensure we know exactly who is creating this
    const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
    
    if (!tenantId) {
      return res.status(403).json({ error: 'FATAL: Cannot create product without a Tenant ID.' });
    }

    // Forcibly inject the tenantId into the data payload before saving to MongoDB
    // (This prevents users from forging a different tenantId in the frontend JSON)
    const productData = { 
      ...req.body, 
      tenantId: tenantId 
    };
    
    const newProduct = new Product(productData);
    await newProduct.save();
    
    res.status(201).json(newProduct);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    // 🚨 THE SECURITY LOCK: Fallback check for both common middleware injection patterns
    const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
    
    if (!tenantId) {
      // Never proceed if tenant is unknown. Hard reject.
      return res.status(403).json({ error: 'FATAL: Tenant identity missing from request.' });
    }

    // 1. Base query strictly locked to the authenticated tenant
    const query: any = { tenantId: tenantId };
    
    // 2. Hide archived items UNLESS explicitly requested
    if (req.query.includeArchived !== 'true') {
      query.isActive = { $ne: false };
    }

    const products = await Product.find(query)
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