import { Request, Response } from 'express';
import Customer from '../models/Customer';

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone } = req.body;
    const tenantId = (req as any).tenantId;

    if (!tenantId) return res.status(401).json({ error: 'Unauthorized' });

    
    if (phone) {
      const existing = await Customer.findOne({ tenantId, phone });
      if (existing) return res.status(400).json({ error: 'Phone number already registered.' });
    }

    const customer = await Customer.create({ tenantId, firstName, lastName, email, phone });
    res.status(201).json(customer);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    const customers = await Customer.find({ tenantId, status: 'ACTIVE' }).sort({ createdAt: -1 });
    res.status(200).json(customers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};