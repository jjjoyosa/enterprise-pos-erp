import { Request, Response } from 'express';
import Employee from '../models/Employee';
import { hashPassword } from '../../../utils/hash'; 




export const getEmployees = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
    if (!tenantId) return res.status(403).json({ error: 'FATAL: Tenant identity missing.' });

    
    const employees = await Employee.find({ tenantId, isActive: { $ne: false } })
      .select('-pinCode') 
      .sort({ createdAt: -1 });

    res.status(200).json(employees);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};




export const createEmployee = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
    if (!tenantId) return res.status(403).json({ error: 'FATAL: Tenant identity missing.' });

    const { name, email, role, branchId, pinCode } = req.body;

    const existingUser = await Employee.findOne({ tenantId, email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already in use by another employee.' });
    }

    const hashedPin = await hashPassword(pinCode);

    const newEmployee = new Employee({
      tenantId,
      branchId,
      name,
      email,
      pinCode: hashedPin,
      role: role || 'CASHIER',
      isActive: true
    });

    await newEmployee.save();

    const employeeObj = newEmployee.toObject() as any;
    delete employeeObj.pinCode;

    res.status(201).json(employeeObj);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};




export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
    const { id } = req.params;
    const { name, email, role, branchId, pinCode } = req.body;

    if (!tenantId) return res.status(403).json({ error: 'FATAL: Tenant identity missing.' });

    const employee = await Employee.findOne({ _id: id, tenantId });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    
    if (email && email !== employee.email) {
      const existingEmail = await Employee.findOne({ tenantId, email });
      if (existingEmail) return res.status(400).json({ error: 'Email is already in use.' });
      employee.email = email;
    }

    if (name) employee.name = name;
    if (role) employee.role = role;
    if (branchId) employee.branchId = branchId;

    
    if (pinCode) {
      employee.pinCode = await hashPassword(pinCode);
    }

    await employee.save();

    const updatedObj = employee.toObject() as any;
    delete updatedObj.pinCode;

    res.status(200).json(updatedObj);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};




export const archiveEmployee = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
    const { id } = req.params;

    if (!tenantId) return res.status(403).json({ error: 'FATAL: Tenant identity missing.' });

    
    const employee = await Employee.findOneAndUpdate(
      { _id: id, tenantId },
      { isActive: false },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    res.status(200).json({ message: 'Employee successfully archived and access revoked.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};