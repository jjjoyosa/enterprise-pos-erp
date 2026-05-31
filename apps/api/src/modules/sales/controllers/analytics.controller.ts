import { Request, Response } from 'express';
import Sale from '../models/Sale';
import Inventory from '../../inventory/models/Inventory';
import Product from '../../products/models/Product';
import mongoose from 'mongoose';

export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId;
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized' });

    
    const { startDate, endDate } = req.query;
    const dateQuery: any = {
      tenantId: new mongoose.Types.ObjectId(tenantId as string),
      status: { $ne: 'REFUNDED' } 
    };

    if (startDate && endDate) {
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999); 
      dateQuery.createdAt = {
        $gte: new Date(startDate as string),
        $lte: end
      };
    } else {
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dateQuery.createdAt = { $gte: today };
    }

    
    const filteredSales = await Sale.find(dateQuery);

    let totalRevenue = 0;
    let totalCOGS = 0;

    filteredSales.forEach(sale => {
      totalRevenue += sale.total;
      sale.items.forEach(item => {
        
        totalCOGS += (item.unitCost || 0) * item.quantity;
      });
    });

    const netProfit = totalRevenue - totalCOGS;
    const orderCount = filteredSales.length;

    
    const topProducts = await Sale.aggregate([
      { $match: dateQuery },
      { $unwind: "$items" },
      { $group: { _id: "$items.productId", totalSold: { $sum: "$items.quantity" } } },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          name: { $ifNull: ["$productInfo.name", "Unknown Product"] },
          totalSold: 1
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    
    const lowStockInventory = await Inventory.find({ 
      tenantId, 
      quantity: { $lt: 16 } 
    })
    .populate('productId', 'name sku')
    .limit(5);

    const formattedLowStock = lowStockInventory.map((inv: any) => ({
      _id: inv.productId._id,
      name: inv.productId.name,
      sku: inv.productId.sku,
      stock: inv.quantity 
    }));

    
    res.status(200).json({
      totalRevenue,      
      netProfit,         
      orderCount,
      lowStockProducts: formattedLowStock,
      topProducts
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};


export const getABCAnalysis = async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId;
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const { startDate, endDate } = req.query;
    const dateQuery: any = {
      tenantId: new mongoose.Types.ObjectId(tenantId as string),
      status: { $ne: 'REFUNDED' }
    };

    if (startDate && endDate) {
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);
      dateQuery.createdAt = { $gte: new Date(startDate as string), $lte: end };
    } else {
      
      const start = new Date();
      start.setDate(start.getDate() - 30);
      dateQuery.createdAt = { $gte: start };
    }

    
    const salesData = await Sale.aggregate([
      { $match: dateQuery },
      { $unwind: "$items" },
      { $group: {
          _id: "$items.productId",
          revenue: { $sum: "$items.subtotal" },
          unitsSold: { $sum: "$items.quantity" }
      }},
      { $sort: { revenue: -1 } } 
    ]);

    
    const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
    
    let cumulativeRevenue = 0;

    
    const classifiedItems = await Promise.all(salesData.map(async (item) => {
      cumulativeRevenue += item.revenue;
      const cumulativePercentage = totalRevenue > 0 ? (cumulativeRevenue / totalRevenue) : 0;

      let grade = 'C';
      if (cumulativePercentage <= 0.80) {
        grade = 'A'; 
      } else if (cumulativePercentage <= 0.95) {
        grade = 'B'; 
      } 

      const product = await Product.findById(item._id).select('name sku');
      const inventory = await Inventory.findOne({ tenantId, productId: item._id }).select('quantity');

      return {
        _id: item._id,
        name: product?.name || 'Unknown Product',
        sku: product?.sku || 'N/A',
        revenue: item.revenue,
        unitsSold: item.unitsSold,
        cumulativePercentage: cumulativePercentage * 100,
        grade,
        currentStock: inventory?.quantity || 0
      };
    }));

    const summary = {
      A: classifiedItems.filter(i => i.grade === 'A').length,
      B: classifiedItems.filter(i => i.grade === 'B').length,
      C: classifiedItems.filter(i => i.grade === 'C').length,
    };

    res.status(200).json({ summary, items: classifiedItems });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};