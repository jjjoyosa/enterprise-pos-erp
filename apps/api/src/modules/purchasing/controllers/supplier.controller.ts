import { Request, Response } from 'express';
import Supplier from '../models/Supplier';

export const getSuppliers = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized: Tenant missing' });

    
    const suppliers = await Supplier.find({ tenantId, isActive: { $ne: false } }).sort({ name: 1 });
    res.status(200).json(suppliers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createSupplier = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized: Tenant missing' });

    const { name, contactPerson, email, phone, address, tin, paymentTerms, notes } = req.body;

    const existing = await Supplier.findOne({ tenantId, name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ error: 'A supplier with this name already exists.' });
    }

    const newSupplier = await Supplier.create({
      tenantId, name, contactPerson, email, phone, address, tin, paymentTerms, notes, isActive: true
    });

    res.status(201).json(newSupplier);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSupplier = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    const { id } = req.params;
    
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized: Tenant missing' });

    const updatedSupplier = await Supplier.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedSupplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.status(200).json(updatedSupplier);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};


export const deleteSupplier = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId;
    const { id } = req.params;
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized: Tenant missing' });

    const archivedSupplier = await Supplier.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!archivedSupplier) return res.status(404).json({ error: 'Supplier not found' });

    res.status(200).json({ message: 'Supplier archived successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};