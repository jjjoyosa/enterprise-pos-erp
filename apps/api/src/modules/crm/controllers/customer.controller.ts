import { Request, Response } from 'express';
import Customer from '../models/Customer';


const getTenantId = (req: Request) => {
  return (req as any).tenantId || (req as any).user?.tenantId;
};

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized: Missing tenant context' });

    
    const customers = await Customer.find({ tenantId }).sort({ createdAt: -1 });
    res.status(200).json(customers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createCustomer = async (req: Request, res: Response) => {

  console.log("CONTROLLER: Incoming request tenantId:", (req as any).tenantId);
  try {
    
    console.log("Request User/Tenant Context:", { 
        tenantId: req.tenantId, 
        user: req.user 
    });

    
    const tenantId = req.tenantId || req.user?.tenantId || req.body?.tenantId;

    if (!tenantId) {
      // Add a log to see EXACTLY what is in req.user
      console.log("DEBUG: Full req.user object:", req.user);
      return res.status(401).json({ error: 'Unauthorized: tenantId is missing from token' });
    }

    const { firstName, lastName, phone, email } = req.body;
    
    const newCustomer = await Customer.create({ 
      tenantId, 
      firstName, 
      lastName, 
      phone, 
      email 
    });
    
    res.status(201).json(newCustomer);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized: Missing tenant context' });

    const { id } = req.params;
    
    const updatedCustomer = await Customer.findOneAndUpdate(
      { _id: id, tenantId },
      req.body,
      { new: true }
    );
    
    if (!updatedCustomer) return res.status(404).json({ error: 'Customer not found' });
    res.status(200).json(updatedCustomer);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);
    if (!tenantId) return res.status(401).json({ error: 'Unauthorized: Missing tenant context' });

    const { id } = req.params;
    
    const deletedCustomer = await Customer.findOneAndDelete({ _id: id, tenantId });
    if (!deletedCustomer) return res.status(404).json({ error: 'Customer not found' });
    
    res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};