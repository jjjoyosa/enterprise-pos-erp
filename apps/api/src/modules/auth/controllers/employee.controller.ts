import { Request, Response } from 'express';
import Employee from '../models/Employee';
import { hashPassword } from '../../../utils/hash'; 

// -------------------------------------------------------------
// GET ALL STAFF
// -------------------------------------------------------------
export const getEmployees = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
    if (!tenantId) return res.status(403).json({ error: 'FATAL: Tenant identity missing.' });

    // Fetch employees, explicitly hiding the pinCode from the frontend for security
    const employees = await Employee.find({ tenantId, isActive: { $ne: false } })
      .select('-pinCode') 
      .sort({ createdAt: -1 });

    res.status(200).json(employees);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// -------------------------------------------------------------
// CREATE NEW STAFF (Hire Cashier/Manager)
// -------------------------------------------------------------
export const createEmployee = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
    if (!tenantId) return res.status(403).json({ error: 'FATAL: Tenant identity missing.' });

    const { name, email, role, branchId, pinCode } = req.body;

    // Check if email already exists within this tenant
    const existingUser = await Employee.findOne({ tenantId, email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already in use by another employee.' });
    }

    // Hash the PIN before saving to the database
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

    // Remove the hashed PIN before sending the response back to the admin dashboard
    const employeeObj = newEmployee.toObject() as any;
    delete employeeObj.pinCode;

    res.status(201).json(employeeObj);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};