import { Request, Response } from 'express';
import Shift from '../models/Shift';
import Sale from '../../sales/models/Sale'; 
import Warehouse from '../../inventory/models/Warehouse';

export const openShift = async (req: Request, res: Response) => {
  try {
    const { startingCash } = req.body;
    
    const cashierId = (req as any).user?.id || (req as any).user?.userId;
    const tenantId = (req as any).user?.tenantId || (req as any).tenantId;

    if (!cashierId || !tenantId) {
      return res.status(401).json({ error: 'Unauthorized: Missing identity or tenant context' });
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
      status: 'OPEN'
    });

    res.status(201).json(newShift);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCurrentShift = async (req: Request, res: Response) => {
  try {
    const cashierId = (req as any).user?.id || (req as any).user?.userId;
    const tenantId = (req as any).user?.tenantId || (req as any).tenantId;

    if (!cashierId) return res.status(401).json({ error: 'Unauthorized' });

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

export const recordCashMovement = async (req: Request, res: Response) => {
  try {
    const { type, amount, reason } = req.body;
    
    const cashierId = (req as any).user?.id || (req as any).user?.userId;
    const tenantId = (req as any).user?.tenantId || (req as any).tenantId;

    if (!cashierId || !tenantId) return res.status(401).json({ error: 'Unauthorized' });
    if (!type || !amount || !reason) return res.status(400).json({ error: 'Missing required fields' });
    if (amount <= 0) return res.status(400).json({ error: 'Amount must be greater than zero' });

    const shift = await Shift.findOne({ cashierId, tenantId, status: 'OPEN' });
    
    if (!shift) {
      return res.status(404).json({ error: 'No open shift found.' });
    }

    
    const movement = { type, amount, reason, timestamp: new Date() };
    
    
    if (!shift.cashMovements) shift.cashMovements = [];
    shift.cashMovements.push(movement);

    
    if (type === 'PAY_IN') {
      shift.expectedCash += amount;
    } else if (type === 'PAY_OUT') {
      shift.expectedCash -= amount;
    }

    await shift.save();

    res.status(200).json({ message: `Successfully recorded ${type.replace('_', ' ')}`, shift });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const closeShift = async (req: Request, res: Response) => {
  try {
    const { endingCash } = req.body;
    
    const cashierId = (req as any).user?.id || (req as any).user?.userId;
    const tenantId = (req as any).user?.tenantId || (req as any).tenantId;
    
    if (!cashierId) return res.status(401).json({ error: 'Unauthorized: Cashier identity missing' });

    const shift = await Shift.findOne({ cashierId, tenantId, status: 'OPEN' });

    if (!shift) {
      return res.status(404).json({ error: 'No open shift to close.' });
    }
    
    
    
    
    const cashSalesDocs = await Sale.find({ 
      tenantId, 
      shiftId: shift._id, 
      paymentMethod: 'CASH',
      status: { $ne: 'REFUNDED' } 
    });

    
    const cashSalesTotal = cashSalesDocs.reduce((sum, sale) => sum + sale.total, 0);
    
    
    let totalPayIns = 0;
    let totalPayOuts = 0;
    
    if (shift.cashMovements && shift.cashMovements.length > 0) {
      shift.cashMovements.forEach((movement: any) => {
        if (movement.type === 'PAY_IN') totalPayIns += movement.amount;
        if (movement.type === 'PAY_OUT') totalPayOuts += movement.amount;
      });
    }

    
    const expectedCash = (shift.startingCash + cashSalesTotal + totalPayIns) - totalPayOuts;
    const variance = endingCash - expectedCash;

    shift.status = 'CLOSED';
    shift.endTime = new Date();
    shift.expectedCash = expectedCash; 
    shift.endingCash = endingCash;

    if (!shift.warehouseId) {
      const warehouse = await Warehouse.findOne({ tenantId });
      if (warehouse) shift.warehouseId = warehouse._id;
    }
    
    await shift.save();

    res.status(200).json({ 
      message: 'Shift closed', 
      shift,
      summary: {
        startingCash: shift.startingCash,
        cashSales: cashSalesTotal,
        totalPayIns,
        totalPayOuts,
        expectedCash,
        actualEndingCash: endingCash,
        variance 
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};