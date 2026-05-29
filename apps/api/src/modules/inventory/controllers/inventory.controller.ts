import { Request, Response } from 'express';
import Warehouse from '../models/Warehouse';
import Inventory from '../models/Inventory';
import StockMovement from '../models/StockMovement';
import Batch from '../models/Batch'; 
import { logAuditEvent } from '../../audit/services/audit.service'; 
import { checkAndDraftPO } from '../../purchasing/services/autoPurchasing.service'; 

export const createWarehouse = async (req: Request, res: Response) => {
  try {
    const { name, isDefault } = req.body;
    const warehouse = await Warehouse.create({
      tenantId: (req as any).tenantId, 
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
      tenantId: (req as any).tenantId, 
      productId,
      warehouseId,
      type,
      quantity: type === 'OUT' ? -Math.abs(quantity) : quantity,
      reference,
      notes
    });

    const updatedInventory = await Inventory.findOneAndUpdate(
      { tenantId: (req as any).tenantId, productId, warehouseId }, 
      { $inc: { quantity: movement.quantity } },
      { new: true, upsert: true }
    );

    
    if (updatedInventory) {
      
      checkAndDraftPO((req as any).tenantId.toString(), productId.toString(), updatedInventory.quantity);
    }

    res.status(201).json({ 
      message: 'Stock movement recorded successfully', 
      movement, 
      currentStock: updatedInventory ? updatedInventory.quantity : 0 
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

    const inventory = await Inventory.find({ tenantId: (req as any).tenantId }) 
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
    
    const query: any = { tenantId: (req as any).tenantId }; 
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

export const processSupplierReturn = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    const { productId, warehouseId, quantity, reason, managerName } = req.body;

    if (!tenantId || !productId || !warehouseId || !quantity) {
      return res.status(400).json({ error: 'Missing required RMA fields.' });
    }

    const inventory = await Inventory.findOneAndUpdate(
      { tenantId, productId, warehouseId },
      { $inc: { quantity: -Math.abs(quantity) } },
      { new: true }
    );

    if (!inventory) {
      return res.status(404).json({ error: 'Inventory record not found for this product/warehouse.' });
    }

    const rmaReference = `RMA-${Date.now().toString().slice(-6)}`;
    await StockMovement.create({
      tenantId,
      productId,
      warehouseId,
      type: 'OUT',
      quantity: -Math.abs(quantity),
      reference: rmaReference,
      notes: `Supplier Return: ${reason}`
    });

    let remainingQtyToDeduct = Math.abs(quantity);
    const activeBatches = await Batch.find({
      tenantId,
      productId,
      status: 'ACTIVE'
    }).sort({ expirationDate: 1, createdAt: 1 }); 

    for (const batch of activeBatches) {
      if (remainingQtyToDeduct <= 0) break;

      if (batch.currentQuantity <= remainingQtyToDeduct) {
        remainingQtyToDeduct -= batch.currentQuantity;
        batch.currentQuantity = 0;
        batch.status = 'DEPLETED';
      } else {
        batch.currentQuantity -= remainingQtyToDeduct;
        remainingQtyToDeduct = 0;
      }
      await batch.save();
    }

    await logAuditEvent({
      tenantId,
      actorName: managerName || 'System',
      actorRole: 'MANAGER',
      actionType: 'SUPPLIER_RETURN',
      targetEntity: 'Inventory',
      targetId: inventory._id.toString(),
      details: `Processed RMA (${rmaReference}) returning ${quantity} units of product ${productId} to supplier. Reason: ${reason}`
    });

    checkAndDraftPO(tenantId.toString(), productId.toString(), inventory.quantity);

    res.status(200).json({ 
      message: 'Supplier return processed successfully', 
      reference: rmaReference,
      newQuantity: inventory.quantity 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};