import Product from '../../products/models/Product';
import PurchaseOrder from '../models/PurchaseOrder'; 
import Supplier from '../models/Supplier'; 
import { logAuditEvent } from '../../audit/services/audit.service';

export const checkAndDraftPO = async (tenantId: string, productId: string, currentStock: number) => {
  try {
    const product = await Product.findOne({ _id: productId, tenantId });
    if (!product) return;

    const LOW_STOCK_THRESHOLD = 20; 
    const RESTOCK_TARGET = 100;

    if (currentStock > LOW_STOCK_THRESHOLD) return;

    const existingDraft = await PurchaseOrder.findOne({
      tenantId,
      status: 'DRAFT',
      'items.productId': productId
    });

    if (existingDraft) return; 

    const orderQuantity = RESTOCK_TARGET - currentStock;
    const poNumber = `PO-${Date.now().toString().slice(-6)}`;

    
    
    let finalSupplierId = (product as any).supplierId;
    if (!finalSupplierId) {
      const fallbackSupplier = await Supplier.findOne({ tenantId });
      if (!fallbackSupplier) {
        console.log(`[ERP Engine] Cannot draft PO for ${product.name}: No suppliers found in the database. Please create a supplier first.`);
        return; 
      }
      finalSupplierId = fallbackSupplier._id;
    }

    
    const newPO = await PurchaseOrder.create({
      tenantId,
      poNumber,
      status: 'DRAFT',
      supplierId: finalSupplierId, 
      items: [{
        productId: product._id,
        quantity: orderQuantity,
        unitCost: product.costPrice || 0,
        total: orderQuantity * (product.costPrice || 0) 
      }],
      total: orderQuantity * (product.costPrice || 0), 
      notes: 'SYSTEM AUTO-DRAFT: Generated due to low stock threshold.'
    });

    await logAuditEvent({
      tenantId,
      actorName: 'System',
      actorRole: 'SYSTEM',
      actionType: 'AUTO_PO_GENERATED',
      targetEntity: 'PurchaseOrder',
      targetId: newPO._id.toString(),
      details: `Auto-drafted PO ${poNumber} for ${orderQuantity} units of ${product.name} (Stock fell to ${currentStock}).`
    });

    console.log(`[ERP Engine] Auto-PO drafted for ${product.name}`);

  } catch (error) {
    console.error('[ERP Engine] Failed to run Auto-Purchasing check', error);
  }
};