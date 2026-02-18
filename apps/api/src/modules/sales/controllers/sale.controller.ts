import { Request, Response } from 'express';
import Sale from '../models/Sale';
import Product from '../../products/models/Product';
import StockMovement from '../../inventory/models/StockMovement';
import Inventory from '../../inventory/models/Inventory';
import Shift from '../models/Shift'; 
import { generateReceiptNumber } from '../../../utils/receiptGenerator';

export const processSale = async (req: Request, res: Response) => {
  try {
    const { items, paymentMethod, discount = 0 } = req.body;
    const tenantId = req.tenantId;
    const cashierId = req.userId; 

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

    
    const finalTotal = calculatedSubtotal - discount;
    const calculatedTax = finalTotal - (finalTotal / 1.12); 
    const receiptNumber = generateReceiptNumber();

    
    const newSale = await Sale.create({
      tenantId,
      warehouseId, 
      cashierId,   
      shiftId: currentShift._id, 
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

export const getSales = async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId;
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized: Missing tenant context' });

    const sales = await Sale.find({ tenantId })
      .sort({ createdAt: -1 }) 
      .limit(50); 

    res.status(200).json(sales);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getDashboardAnalytics = async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId;
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    
    const todaysSales = await Sale.find({ 
      tenantId, 
      createdAt: { $gte: today } 
    });

    const todaysRevenue = todaysSales.reduce((sum, sale) => sum + sale.total, 0);
    const orderCount = todaysSales.length;

    
    const lowStockInventory = await Inventory.find({ 
      tenantId, 
      quantity: { $lt: 10 } 
    })
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

    res.status(200).json({
      todaysRevenue,
      orderCount,
      lowStockProducts,
      topProducts: populatedTopProducts
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};