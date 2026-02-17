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