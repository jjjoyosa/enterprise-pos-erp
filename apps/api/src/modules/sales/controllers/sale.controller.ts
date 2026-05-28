import { Request, Response } from 'express';
import Sale from '../models/Sale';
import Product from '../../products/models/Product';
import StockMovement from '../../inventory/models/StockMovement';
import Inventory from '../../inventory/models/Inventory';
import Shift from '../models/Shift'; 
import Batch from '../../inventory/models/Batch'; 
import Customer from '../../crm/models/Customer';
import { getNextOfficialReceiptNumber } from '../../../utils/receiptGenerator';
import { logAuditEvent } from '../../audit/services/audit.service'; // <-- NEW AUDIT SERVICE

export const processSale = async (req: Request, res: Response) => {
  try {
    const { items, paymentMethod, discount = 0, customerId, pointsRedeemed = 0 } = req.body;
    const tenantId = (req as any).tenantId; 
    const cashierId = (req as any).userId; 

    if (!cashierId || !tenantId) {
      return res.status(401).json({ error: 'Unauthorized: Missing identity context' });
    }

    const currentShift = await Shift.findOne({ 
      cashierId, 
      tenantId, 
      status: 'OPEN' 
    });

    if (!currentShift) {
      return res.status(403).json({ error: 'Cannot process sale: Register is locked. Please start a shift.' });
    }

    const warehouseId = currentShift.warehouseId;
    let calculatedSubtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId, tenantId });
      if (!product) throw new Error(`Product ${item.productId} not found`);

      const lineSubtotal = product.basePrice * item.quantity;
      calculatedSubtotal += lineSubtotal;

      processedItems.push({
        productId: product._id,
        quantity: item.quantity,
        unitPrice: product.basePrice,
        subtotal: lineSubtotal
      });
    }

    const finalTotal = calculatedSubtotal - discount - pointsRedeemed;
    const calculatedTax = finalTotal - (finalTotal / 1.12); 
    const receiptNumber = await getNextOfficialReceiptNumber(tenantId);
    
    const newSale = await Sale.create({
      tenantId,
      warehouseId, 
      cashierId,
      customerId, 
      shiftId: currentShift._id, 
      receiptNumber,
      items: processedItems,
      subtotal: calculatedSubtotal,
      tax: calculatedTax,
      discount,
      pointsRedeemed, 
      total: finalTotal,
      paymentMethod
    });

    for (const item of processedItems) {
      await StockMovement.create({
        tenantId,
        productId: item.productId,
        warehouseId,
        type: 'OUT',
        quantity: -Math.abs(item.quantity),
        reference: newSale.receiptNumber,
        notes: 'POS Sale'
      });

      let remainingQtyToDeduct = item.quantity;
      
      const activeBatches = await Batch.find({
        tenantId,
        productId: item.productId,
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

      await Inventory.findOneAndUpdate(
        { tenantId, productId: item.productId, warehouseId },
        { $inc: { quantity: -Math.abs(item.quantity) } },
        { new: true, upsert: true }
      );
    }
    
    let pointsEarned = 0;
    if (customerId) {
      pointsEarned = Math.floor(finalTotal / 100); 

      await Customer.findOneAndUpdate(
        { _id: customerId, tenantId },
        { 
          $inc: { 
            totalVisits: 1, 
            lifetimeValue: finalTotal,
            loyaltyPoints: pointsEarned - pointsRedeemed 
          } 
        }
      );
    }

    currentShift.expectedCash += finalTotal;
    currentShift.totalTransactions += 1;
    await currentShift.save();

    res.status(201).json({ 
      message: 'Sale completed successfully', 
      sale: newSale,
      pointsEarned
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getSales = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
    if (!tenantId) return res.status(403).json({ error: 'FATAL: Tenant identity missing.' });
    
    const sales = await Sale.find({ tenantId })
      .populate('cashierId', 'name firstName lastName email') 
      .sort({ createdAt: -1 })
      .limit(100);
    
    const formattedSales = sales.map((sale: any) => {
      const saleObj = sale.toObject();
      if (saleObj.cashierId) {
        if (!saleObj.cashierId.name && saleObj.cashierId.firstName) {
          saleObj.cashierId.name = `${saleObj.cashierId.firstName} ${saleObj.cashierId.lastName || ''}`.trim();
        }
      }
      return saleObj;
    });

    res.status(200).json(formattedSales);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getDashboardAnalytics = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysSales = await Sale.find({ tenantId, createdAt: { $gte: today } });

    const todaysRevenue = todaysSales.reduce((sum, sale) => sum + sale.total, 0);
    const orderCount = todaysSales.length;

    const lowStockInventory = await Inventory.find({ tenantId, quantity: { $lt: 10 } })
    .populate('productId', 'name sku')
    .limit(5);

    const lowStockProducts = lowStockInventory.map((inv: any) => ({
      _id: inv.productId._id,
      name: inv.productId.name,
      sku: inv.productId.sku,
      stock: inv.quantity
    }));

    const topProducts = await Sale.aggregate([
      { $match: { tenantId: tenantId } }, 
      { $unwind: "$items" }, 
      { $group: { 
          _id: "$items.productId", 
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.subtotal" }
      }},
      { $sort: { totalSold: -1 } }, 
      { $limit: 5 }
    ]);

    const populatedTopProducts = await Promise.all(topProducts.map(async (p) => {
      const product = await Product.findById(p._id).select('name');
      return {
        name: product ? product.name : 'Unknown Product',
        totalSold: p.totalSold,
        revenue: p.revenue
      };
    }));

    res.status(200).json({ todaysRevenue, orderCount, lowStockProducts, topProducts: populatedTopProducts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const processRefund = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { refundReason, itemsToRefund } = req.body; 
    const tenantId = (req as any).tenantId;

    if (!tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const sale = await Sale.findOne({ _id: id, tenantId });
    if (!sale) return res.status(404).json({ error: 'Sale not found' });
    if (sale.status === 'REFUNDED') return res.status(400).json({ error: 'Sale is already fully refunded' });

    let totalRefundAmount = 0;

    for (const refundReq of itemsToRefund) {
      const saleItem = sale.items.find((i: any) => i.productId.toString() === refundReq.productId);
      if (!saleItem) throw new Error(`Product ${refundReq.productId} was not on this receipt`);
      if (refundReq.quantity > saleItem.quantity) throw new Error(`Cannot refund more than originally purchased`);

      const refundItemAmount = saleItem.unitPrice * refundReq.quantity;
      totalRefundAmount += refundItemAmount;
      
      await StockMovement.create({
        tenantId,
        productId: refundReq.productId,
        warehouseId: sale.warehouseId,
        type: 'IN', 
        quantity: Math.abs(refundReq.quantity), 
        reference: `REFUND-${sale.receiptNumber}`,
        notes: refundReason || 'Customer Return'
      });

      const activeBatch = await Batch.findOne({
        tenantId,
        productId: refundReq.productId,
      }).sort({ updatedAt: -1 });

      if (activeBatch) {
        activeBatch.currentQuantity += Math.abs(refundReq.quantity);
        
        if (activeBatch.status === 'DEPLETED' && activeBatch.currentQuantity > 0) {
          activeBatch.status = 'ACTIVE';
        }
        await activeBatch.save();
      }
      
      await Inventory.findOneAndUpdate(
        { tenantId, productId: refundReq.productId, warehouseId: sale.warehouseId },
        { $inc: { quantity: Math.abs(refundReq.quantity) } }, 
        { new: true }
      );
    }

    const isFullRefund = totalRefundAmount >= sale.total;

    await Shift.findOneAndUpdate(
      { _id: sale.shiftId, tenantId },
      { $inc: { expectedCash: -totalRefundAmount } }
    );

    if (sale.customerId) {
      const pointsEarned = sale.pointsRedeemed > 0 ? 0 : Math.floor(totalRefundAmount / 100);
      const pointsToReturn = isFullRefund ? sale.pointsRedeemed : 0;
      
      await Customer.findOneAndUpdate(
        { _id: sale.customerId, tenantId },
        { 
          $inc: { 
            lifetimeValue: -totalRefundAmount,
            loyaltyPoints: pointsToReturn - pointsEarned 
          } 
        }
      );
    }
    
    sale.status = isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED';
    sale.notes = (sale.notes ? sale.notes + ' | ' : '') + `Refunded ${isFullRefund ? 'Fully' : 'Partially'}: ₱${totalRefundAmount} - ${refundReason}`;
    
    await sale.save();

    // --- NEW: WRITE TO IMMUTABLE AUDIT TRAIL ---
    const authorizedBy = refundReason.includes('(Authorized by') 
      ? refundReason.split('(Authorized by ')[1].replace(')', '') 
      : 'System';

    await logAuditEvent({
      tenantId,
      actorName: authorizedBy,
      actorRole: 'MANAGER',
      actionType: 'VOID_TRANSACTION',
      targetEntity: 'Sale',
      targetId: sale._id.toString(),
      details: `Voided transaction ${sale.receiptNumber} for ₱${totalRefundAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}. Reason: ${refundReason}`
    });

    res.status(200).json({ message: 'Refund processed successfully and stock restored.', refundAmount: totalRefundAmount, saleStatus: sale.status });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};