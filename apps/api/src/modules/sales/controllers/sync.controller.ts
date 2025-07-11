import { Request, Response } from 'express';
import Sale from '../models/Sale';
import Product from '../../products/models/Product';
import StockMovement from '../../inventory/models/StockMovement';
import Inventory from '../../inventory/models/Inventory';

export const syncOfflineSales = async (req: Request, res: Response) => {
  try {
    const { sales } = req.body; 
    const tenantId = req.tenantId;
    
    const results = {
      synced: [] as string[],
      failed: [] as { receiptNumber: string, reason: string }[],
      skipped: [] as string[] 
    };

    for (const offlineSale of sales) {
      try {
        
        const existingSale = await Sale.findOne({ 
          tenantId, 
          receiptNumber: offlineSale.receiptNumber 
        });

        if (existingSale) {
          results.skipped.push(offlineSale.receiptNumber);
          continue; 
        }

        let calculatedSubtotal = 0;
        const processedItems = [];

        
        for (const item of offlineSale.items) {
          const product = await Product.findOne({ _id: item.productId, tenantId });
          
          if (!product) {
            throw new Error(`Product ID ${item.productId} not found in database.`);
          }

          
          const lineSubtotal = product.basePrice * item.quantity;
          calculatedSubtotal += lineSubtotal;

          processedItems.push({
            productId: product._id,
            quantity: item.quantity,
            unitPrice: product.basePrice,
            subtotal: lineSubtotal
          });
        }

        const calculatedTax = calculatedSubtotal * 0.12;
        const finalTotal = calculatedSubtotal + calculatedTax - (offlineSale.discount || 0);

        
        const newSale = await Sale.create({
          tenantId,
          warehouseId: offlineSale.warehouseId,
          cashierId: offlineSale.cashierId,
          receiptNumber: offlineSale.receiptNumber, 
          items: processedItems,
          subtotal: calculatedSubtotal,
          tax: calculatedTax,
          discount: offlineSale.discount || 0,
          total: finalTotal,
          paymentMethod: offlineSale.paymentMethod,
          createdAt: new Date(offlineSale.timestamp) 
        });

        
        for (const item of processedItems) {
          await StockMovement.create({
            tenantId,
            productId: item.productId,
            warehouseId: offlineSale.warehouseId,
            type: 'OUT',
            quantity: -Math.abs(item.quantity),
            reference: newSale.receiptNumber,
            notes: 'Offline POS Sync'
          });

          await Inventory.findOneAndUpdate(
            { tenantId, productId: item.productId, warehouseId: offlineSale.warehouseId },
            { $inc: { quantity: -Math.abs(item.quantity) } },
            { new: true, upsert: true }
          );
        }

        results.synced.push(offlineSale.receiptNumber);

      } catch (err: any) {
        
        results.failed.push({ 
          receiptNumber: offlineSale.receiptNumber, 
          reason: err.message 
        });
      }
    }

    res.status(200).json({
      message: 'Offline sync complete',
      summary: {
        totalReceived: sales.length,
        syncedCount: results.synced.length,
        skippedCount: results.skipped.length,
        failedCount: results.failed.length
      },
      details: results
    });

  } catch (error: any) {
    res.status(500).json({ error: 'Critical sync failure', details: error.message });
  }
};