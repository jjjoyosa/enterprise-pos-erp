import { Request, Response } from 'express';
import PurchaseOrder from '../models/PurchaseOrder';

export const getPOs = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized' });

    
    const pos = await PurchaseOrder.find({ tenantId })
      .populate('supplierId', 'name')
      .populate('items.productId', 'name sku')
      .sort({ createdAt: -1 });

    res.status(200).json(pos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createPO = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    const { supplierId, expectedDeliveryDate, items, notes } = req.body;

    
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
    const count = await PurchaseOrder.countDocuments({ tenantId });
    const poNumber = `PO-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;

    
    let totalAmount = 0;
    const processedItems = items.map((item: any) => {
      const lineTotal = item.quantity * item.unitCost;
      totalAmount += lineTotal;
      return { ...item, total: lineTotal };
    });

    const newPO = await PurchaseOrder.create({
      tenantId,
      supplierId,
      poNumber,
      expectedDeliveryDate,
      items: processedItems,
      totalAmount,
      notes
    });

    res.status(201).json(newPO);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePOStatus = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    const { id } = req.params;
    const { status } = req.body;

    const po = await PurchaseOrder.findOneAndUpdate(
      { _id: id, tenantId },
      { status },
      { new: true }
    );

    if (!po) return res.status(404).json({ error: 'PO not found' });
    res.status(200).json(po);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};