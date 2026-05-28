import { Request, Response } from 'express';
import Category from '../models/Category';
import Product from '../models/Product';

import Inventory from '../../inventory/models/Inventory'; 
import Warehouse from '../../inventory/models/Warehouse'; 

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
    const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
    
    if (!tenantId) {
      return res.status(403).json({ error: 'FATAL: Cannot create product without a Tenant ID.' });
    }

    const productData = { 
      ...req.body, 
      tenantId: tenantId 
    };
    
    const newProduct = new Product(productData);
    await newProduct.save();
    
    
    
    
    if (newProduct.trackInventory) {
      
      const defaultWarehouse = await Warehouse.findOne({ tenantId, isDefault: true }) 
                            || await Warehouse.findOne({ tenantId });
      
      if (defaultWarehouse) {
        
        await Inventory.create({
          tenantId: tenantId,
          productId: newProduct._id,
          warehouseId: defaultWarehouse._id,
          quantity: 0
        });
        console.log(`[ERP] Auto-initialized inventory (0 stock) for new product: ${newProduct.sku}`);
      } else {
        console.warn(`[ERP WARNING] Product ${newProduct.sku} created, but NO warehouse found for tenant ${tenantId}.`);
      }
    }

    res.status(201).json(newProduct);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
    
    if (!tenantId) {
      return res.status(403).json({ error: 'FATAL: Tenant identity missing from request.' });
    }

    const query: any = { tenantId: tenantId };
    
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
    
    const { name, basePrice, costPrice, trackInventory, categoryId, imageUrl } = req.body;

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: id, tenantId: req.tenantId },
      
      { name, basePrice, costPrice, trackInventory, categoryId, imageUrl },
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
    const categories = await Category.find({ tenantId: req.tenantId }).sort({ name: 1 });
    res.status(200).json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};