import { Request, Response } from 'express';
import Tenant from '../../organizations/models/Tenant';
import Role from '../models/Role';
import User from '../models/User';
import { hashPassword } from '../../../utils/hash';

export const registerTenant = async (req: Request, res: Response) => {
  try {
    const { companyName, tin, email, password, firstName, lastName } = req.body;

    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    
    const newTenant = await Tenant.create({
      name: companyName,
      tin: tin,
      vatType: 'NON-VAT' 
    });

    
    const adminRole = await Role.create({
      tenantId: newTenant._id,
      name: 'Super Admin',
      permissions: ['*'] 
    });

    
    const hashedPassword = await hashPassword(password);
    
    const newUser = await User.create({
      tenantId: newTenant._id,
      roleId: adminRole._id,
      email,
      passwordHash: hashedPassword,
      firstName,
      lastName,
      isActive: true
    });

    res.status(201).json({
      message: 'Tenant and Super Admin successfully created.',
      tenantId: newTenant._id,
      user: {
        id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to register tenant', details: error.message });
  }
};