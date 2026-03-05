import { Request, Response } from 'express';
import Warehouse from '../models/Warehouse';
import Inventory from '../models/Inventory';
import StockMovement from '../models/StockMovement';

export const createWarehouse = async (req: Request, res: Response) => {
  try {
    const { name, isDefault } = req.body;
    const warehouse = await Warehouse.create({
      tenantId: req.tenantId,
      name,
      isDefault
    });
    res.status(201).json({ message: 'Warehouse created', warehouse });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const recordStockMovement = async (req: Request, res: Response) => {
  try {
    const { productId, warehouseId, type, quantity, reference, notes } = req.body;

    
    const movement = await StockMovement.create({
      tenantId: req.tenantId,
      productId,
      warehouseId,
      type,
      quantity: type === 'OUT' ? -Math.abs(quantity) : quantity,
      reference,
      notes
    });

    
    const updatedInventory = await Inventory.findOneAndUpdate(
      { tenantId: req.tenantId, productId, warehouseId },
      { $inc: { quantity: movement.quantity } },
      { new: true, upsert: true }
    );

    res.status(201).json({ 
      message: 'Stock movement recorded successfully', 
      movement, 
      currentStock: updatedInventory.quantity 
    });
  } catch (error: any) {
    console.error("Stock movement error:", error);
    res.status(400).json({ error: error.message });
  }
};



export const getInventoryLevels = async (req: Request, res: Response) => {
  try {
    
    const productMatch = req.query.includeArchived === 'true' 
      ? {} 
      : { isActive: { $ne: false } };

    
    const inventory = await Inventory.find({ tenantId: req.tenantId })
      .populate({
        path: 'productId',
        match: productMatch
      })
      .populate('warehouseId');

    
    
    const validInventory = inventory.filter(item => item.productId !== null);

    res.status(200).json(validInventory);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getStockMovements = async (req: Request, res: Response) => {
  try {
    const { productId } = req.query;
    
    
    const query: any = { tenantId: req.tenantId };
    if (productId) query.productId = productId;

    const movements = await StockMovement.find(query)
      .populate('productId', 'name sku')
      .populate('warehouseId', 'name')
      .sort({ createdAt: -1 })
      .limit(100); 

    res.status(200).json(movements);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};