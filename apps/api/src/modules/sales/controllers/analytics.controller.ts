import { Request, Response } from 'express';
import Sale from '../models/Sale';
import Inventory from '../../inventory/models/Inventory';
import mongoose from 'mongoose';

export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId;
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    
    
const todaySales = await Sale.aggregate([
  { $match: { 
      tenantId: new mongoose.Types.ObjectId(tenantId as string), 
      createdAt: { $gte: today },
      status: { $ne: 'REFUNDED' } 
  }},
  { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } }
]);

    
    const topProducts = await Sale.aggregate([
      { $match: { tenantId: new mongoose.Types.ObjectId(tenantId as string),
        status: {$ne: 'REFUNDED'}
       } },
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
  quantity: { $lt: 15 } 
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
      todaysRevenue: todaySales.length ? todaySales[0].total : 0,
      orderCount: todaySales.length ? todaySales[0].count : 0,
      lowStockProducts: formattedLowStock,
      topProducts
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};