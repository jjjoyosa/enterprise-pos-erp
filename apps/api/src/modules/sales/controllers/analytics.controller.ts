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

    
    const lowStockItems = await Product.find({ currentStock: { $lt: 15 } })
      .select('name sku currentStock')
      .limit(5);

    res.status(200).json({
      todayGross: todaySales.length ? todaySales[0].total : 0,
      todayCount: todaySales.length ? todaySales[0].count : 0,
      weeklyRevenue,
      lowStockItems
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};