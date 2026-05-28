import { Request, Response } from 'express';
import Shift from '../models/Shift';
import Sale from '../../sales/models/Sale'; 
import Warehouse from '../../inventory/models/Warehouse';
import ZReading from '../models/ZReading';
import { generateZReadingNumber } from '../../../utils/receiptGenerator';
import { logAuditEvent } from '../../audit/services/audit.service';

export const openShift = async (req: Request, res: Response) => {
  try {
    const { startingCash } = req.body;
    
    const cashierId = (req as any).user?.id || (req as any).user?.userId || (req as any).userId;
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
      expectedCash: startingCash, 
      status: 'OPEN'
    });

    res.status(201).json(newShift);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCurrentShift = async (req: Request, res: Response) => {
  try {
    const cashierId = (req as any).user?.id || (req as any).user?.userId || (req as any).userId;
    const tenantId = (req as any).user?.tenantId || (req as any).tenantId;

    if (!cashierId || !tenantId) return res.status(401).json({ error: 'Unauthorized' });

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
    const { type, amount, reason, managerName } = req.body;
    
    const cashierId = (req as any).user?.id || (req as any).user?.userId || (req as any).userId;
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

    
    await logAuditEvent({
      tenantId,
      actorName: managerName || 'System', 
      actorRole: 'MANAGER',
      actionType: type === 'PAY_IN' ? 'CASH_PAY_IN' : 'CASH_PAY_OUT',
      targetEntity: 'Shift',
      targetId: shift._id.toString(),
      details: `Authorized a ${type.replace('_', ' ')} of ₱${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} for reason: "${reason}"`
    });

    res.status(200).json({ message: `Successfully recorded ${type.replace('_', ' ')}`, shift });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const closeShift = async (req: Request, res: Response) => {
  try {
    const { endingCash } = req.body;
    
    const cashierId = (req as any).user?.id || (req as any).user?.userId || (req as any).userId;
    const tenantId = (req as any).user?.tenantId || (req as any).tenantId;
    
    if (!cashierId || !tenantId) return res.status(401).json({ error: 'Unauthorized: Context profile missing' });

    const shift = await Shift.findOne({ cashierId, tenantId, status: 'OPEN' });

    if (!shift) {
      return res.status(404).json({ error: 'No open shift to close.' });
    }
    
    const shiftSales = await Sale.find({ 
      tenantId, 
      shiftId: shift._id, 
      status: { $ne: 'REFUNDED' } 
    });

    let cashSalesTotal = 0;
    let grossSales = 0;
    let netSales = 0;
    let totalTax = 0;
    let totalDiscounts = 0;

    shiftSales.forEach(sale => {
      grossSales += sale.subtotal;
      netSales += sale.total;
      totalTax += sale.tax;
      totalDiscounts += sale.discount;
      if (sale.paymentMethod === 'CASH') {
        cashSalesTotal += sale.total;
      }
    });
    
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

    const zReceiptNumber = await generateZReadingNumber(tenantId);

    await ZReading.create({
      tenantId,
      shiftId: shift._id,
      cashierId,
      zReceiptNumber,
      grossSales,
      netSales,
      totalTax,
      totalDiscounts,
      startingCash: shift.startingCash,
      totalPayIns,
      totalPayOuts,
      expectedCash,
      actualEndingCash: endingCash,
      variance
    });

    shift.status = 'CLOSED';
    shift.endTime = new Date();
    shift.expectedCash = expectedCash; 
    shift.endingCash = endingCash;

    if (!shift.warehouseId) {
      const warehouse = await Warehouse.findOne({ tenantId });
      if (warehouse) shift.warehouseId = warehouse._id;
    }
    
    await shift.save();

    
    await logAuditEvent({
      tenantId,
      actorName: 'System', 
      actorRole: 'SYSTEM',
      actionType: 'SHIFT_CLOSED',
      targetEntity: 'ZReading',
      details: `Shift closed. Expected: ₱${expectedCash.toLocaleString()}. Actual: ₱${endingCash.toLocaleString()}. Variance: ₱${variance.toLocaleString()}`
    });

    res.status(200).json({ 
      message: 'Shift successfully closed and audited Z-Reading archived.', 
      shift,
      summary: {
        startingCash: shift.startingCash,
        cashSales: cashSalesTotal,
        totalPayIns,
        totalPayOuts,
        expectedCash,
        actualEndingCash: endingCash,
        variance,
        grossSales,
        netSales,
        totalTax,
        totalDiscounts
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};