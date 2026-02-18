import { Request, Response } from 'express';
import Sale from '../models/Sale';
import Product from '../../products/models/Product';

export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySales = await Sale.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: "$finalTotal" }, count: { $sum: 1 } } }
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklyRevenue = await Sale.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$finalTotal" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // 1. Fetch raw items safely (Added tenantId security back in)
    const rawLowStockItems = await Product.find({ 
      tenantId: req.tenantId,
      $or: [
        { stockQuantity: { $lt: 15 } },
        { currentStock: { $lt: 15 } }
      ]
    });

    // 2. THE ULTIMATE SCRUBBER: Filter them out using pure JavaScript
    const formattedLowStock = rawLowStockItems
      // Scrub out anything that is archived or inactive
      .filter((item: any) => item.isActive !== false && item.status !== 'ARCHIVED')
      // Map it exactly to what the frontend JSON expects
      .map((item: any) => ({
        _id: item._id,
        name: item.name,
        sku: item.sku,
        stock: item.stockQuantity ?? item.currentStock ?? 0
      }))
      // Keep only the top 5
      .slice(0, 5);

    // 3. Send the clean JSON payload
    res.status(200).json({
      todayGross: todaySales.length ? todaySales[0].total : 0,
      todayCount: todaySales.length ? todaySales[0].count : 0,
      weeklyRevenue,
      lowStockProducts: formattedLowStock // Using the exact key your frontend expects
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};