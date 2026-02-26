import { Request, Response } from 'express';
import DiscountRule from '../models/DiscountRule';

export const createDiscount = async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId;
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const newDiscount = await DiscountRule.create({ ...req.body, tenantId });
    res.status(201).json({ message: 'Discount rule created', discount: newDiscount });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getActiveDiscounts = async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId;
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized' });

    const now = new Date();
    
    // THE FIX: Wrapped the multiple $or conditions inside an $and array
    const discounts = await DiscountRule.find({
      tenantId,
      isActive: true,
      $and: [
        { $or: [{ startDate: { $exists: false } }, { startDate: { $lte: now } }, { startDate: null }] },
        { $or: [{ endDate: { $exists: false } }, { endDate: { $gte: now } }, { endDate: null }] }
      ]
    });

    res.status(200).json(discounts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};