import { Request, Response } from 'express';
import Sale from '../models/Sale';
import Product from '../../products/models/Product';
import StockMovement from '../../inventory/models/StockMovement';
import Inventory from '../../inventory/models/Inventory';
import { generateReceiptNumber } from '../../../utils/receiptGenerator';

export const processSale = async (req: Request, res: Response) => {
  try {
    const { warehouseId, cashierId, items, paymentMethod, discount = 0 } = req.body;
    const tenantId = req.tenantId;

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

    
    const calculatedTax = calculatedSubtotal * 0.12; 
    const finalTotal = calculatedSubtotal + calculatedTax - discount;

    const receiptNumber = generateReceiptNumber();

    
    const newSale = await Sale.create({
      tenantId,
      warehouseId,
      cashierId,
      receiptNumber,
      items: processedItems,
      subtotal: calculatedSubtotal,
      tax: calculatedTax,
      discount,
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

      
      await Inventory.findOneAndUpdate(
        { tenantId, productId: item.productId, warehouseId },
        { $inc: { quantity: -Math.abs(item.quantity) } },
        { new: true, upsert: true }
      );
    }

    res.status(201).json({ message: 'Sale completed successfully', sale: newSale });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};