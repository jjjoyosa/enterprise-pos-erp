import { Request, Response } from 'express';
import Shift from '../models/Shift';
import Sale from '../models/Sale';
import Warehouse from '../../inventory/models/Warehouse';


export const openShift = async (req: Request, res: Response) => {
  try {
    const { startingCash } = req.body;
    const cashierId = req.userId;
    const tenantId = req.tenantId;

    if (!cashierId || !tenantId) {
      return res.status(401).json({ error: 'Unauthorized: Missing identity' });
    }

    
    
    let warehouse = await Warehouse.findOne({ tenantId });
    if (!warehouse) {
      warehouse = await Warehouse.create({ 
        tenantId, 
        name: 'Main Headquarters',
        code: 'HQ-01'
      });
    }

    
    const existingShift = await Shift.findOne({ cashierId, tenantId, status: 'OPEN' });
    if (existingShift) {
      return res.status(400).json({ error: 'You already have an open shift.' });
    }

    
    const newShift = await Shift.create({
      tenantId,
      cashierId,
      warehouseId: warehouse._id, 
      startingCash,
      status: 'OPEN',
      openedAt: new Date() 
    });

    res.status(201).json(newShift);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCurrentShift = async (req: Request, res: Response) => {
  try {
    
    const cashierId = req.userId;
    const tenantId = req.tenantId;

    if (!cashierId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    
    const shift = await Shift.findOne({ 
      cashierId, 
      tenantId, 
      status: 'OPEN' 
    });

    
    res.status(200).json(shift);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const closeShift = async (req: Request, res: Response) => {
  try {
    const { endingCash } = req.body;
    
    
    const cashierId = req.userId;
    const tenantId = req.tenantId;

    if (!cashierId) {
      return res.status(401).json({ error: 'Unauthorized: Cashier identity missing' });
    }

    
    const shift = await Shift.findOne({
      cashierId,
      tenantId, 
      status: 'OPEN'
    });

    if (!shift) {
      return res.status(404).json({ error: 'No open shift to close.' });
    }

    
    const cashSales = await Sale.aggregate([
      { 
        $match: { 
          tenantId, 
          cashierId, 
          paymentMethod: 'CASH',
          
          
          createdAt: { $gte: shift.startTime } 
        } 
      },
      { $group: { _id: null, total: { $sum: "$finalTotal" } } }
    ]);

    const cashSalesTotal = cashSales.length > 0 ? cashSales[0].total : 0;
    const expectedCash = shift.startingCash + cashSalesTotal;
    const variance = endingCash - expectedCash;

    
    shift.status = 'CLOSED';
    shift.endTime = new Date();
    shift.expectedCash = expectedCash;
    shift.endingCash = endingCash;

    
    if (!shift.warehouseId) {
      
      const warehouse = await Warehouse.findOne({ tenantId });
      if (warehouse) {
        shift.warehouseId = warehouse._id;
      }
    }
    
    await shift.save();

    res.status(200).json({ 
      message: 'Shift closed', 
      shift,
      summary: {
        startingCash: shift.startingCash,
        cashSales: cashSalesTotal,
        expectedCash,
        actualEndingCash: endingCash,
        variance 
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};