import { Request, Response } from 'express';
import PurchaseOrder from '../models/PurchaseOrder';
import ReceivingReport from '../models/ReceivingReport';
import Inventory from '../../inventory/models/Inventory'; 

export const receivePurchaseOrder = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    const userId = (req as any).userId;
    const { id: poId } = req.params;
    const { receivedItems, notes } = req.body; 

    if (!tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const po = await PurchaseOrder.findOne({ _id: poId, tenantId });
    if (!po) return res.status(404).json({ error: 'Purchase Order not found.' });
    if (po.status === 'COMPLETED') return res.status(400).json({ error: 'PO is already fully received.' });

    
    const finalItems = po.items.map((item: any) => {
      const received = receivedItems.find((r: any) => r.productId === item.productId.toString());
      return {
        productId: item.productId,
        expectedQty: item.quantity,
        actualQty: received ? received.actualQty : 0,
        unitCost: item.unitCost
      };
    });

    
    const count = await ReceivingReport.countDocuments({ tenantId });
    const rrNumber = `RR-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    const report = await ReceivingReport.create({
      tenantId,
      poId: po._id,
      supplierId: po.supplierId,
      rrNumber,
      items: finalItems,
      receivedBy: userId,
      notes
    });

    
    for (const item of finalItems) {
      if (item.actualQty > 0) {
        await Inventory.findOneAndUpdate(
          { tenantId, productId: item.productId },
          { $inc: { quantity: item.actualQty } },
          { upsert: true, new: true }
        );
        
      }
    }

    
    po.status = 'COMPLETED';
    await po.save();

    res.status(201).json({ message: 'Goods received and inventory updated.', report });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};