import { Request, Response } from 'express';
import Shift from '../models/Shift';
import Sale from '../models/Sale';

const DEV_WAREHOUSE_ID = '6a13f0053e459be6ae886552'; 
const DEV_CASHIER_ID = '6a13eea1a686547665c727e2';

export const openShift = async (req: Request, res: Response) => {
  try {
    const { startingCash } = req.body;

    
    const existingShift = await Shift.findOne({
      cashierId: DEV_CASHIER_ID,
      status: 'OPEN'
    });

    if (existingShift) {
      return res.status(400).json({ error: 'Cashier already has an open shift.' });
    }

    
    const shift = await Shift.create({
      tenantId: req.tenantId || req.headers['x-tenant-id'],
      cashierId: DEV_CASHIER_ID,
      warehouseId: DEV_WAREHOUSE_ID,
      startingCash,
      expectedCash: startingCash
    });

    res.status(201).json({ message: 'Shift opened', shift });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCurrentShift = async (req: Request, res: Response) => {
  try {
    const shift = await Shift.findOne({
      cashierId: DEV_CASHIER_ID,
      status: 'OPEN'
    });

    if (!shift) {
      return res.status(404).json({ message: 'No open shift found.' });
    }

    res.status(200).json(shift);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const closeShift = async (req: Request, res: Response) => {
  try {
    const { endingCash } = req.body;

    const shift = await Shift.findOne({
      cashierId: DEV_CASHIER_ID,
      status: 'OPEN'
    });

    if (!shift) {
      return res.status(404).json({ error: 'No open shift to close.' });
    }

    
    const cashSales = await Sale.aggregate([
      { 
        $match: { 
          cashierId: shift.cashierId, 
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