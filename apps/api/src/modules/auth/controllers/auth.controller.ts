import { Request, Response } from 'express';
import Tenant from '../../organizations/models/Tenant';
import Role from '../models/Role';
import User from '../models/User';
import Employee from '../models/Employee'; 
import { hashPassword } from '../../../utils/hash';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_enterprise_key_2026';

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

export const login = async (req: Request, res: Response) => {
  try {
    console.log("-----------------------------------------");
    console.log("LOGIN ATTEMPT RECEIVED:");
    console.log("Payload:", req.body);

    const { email, password, pinCode } = req.body;
    
    
    const secretKey = password || pinCode;
    console.log("Extracted Secret Key:", secretKey);

    if (!email || !secretKey) {
      console.log("FAIL: Missing email or secretKey");
      return res.status(400).json({ error: 'Email and Password/PIN are required.' });
    }

    
    console.log(`Searching for Super Admin with email: ${email}`);
    const user = await User.findOne({ email, isActive: true });
    
    if (user) {
      console.log("SUCCESS: Found Admin in Database!");
      
      const isMatch = await bcrypt.compare(secretKey, user.passwordHash);
      console.log("Bcrypt Match Result:", isMatch);
      
      if (!isMatch) {
        console.log("FAIL: Passwords did not match!");
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      console.log("SUCCESS: Password matched. Generating tokens...");
      
      const token = jwt.sign(
        { userId: user._id, tenantId: user.tenantId, roleId: user.roleId },
        process.env.JWT_SECRET || 'super_secret_enterprise_key_2026',
        { expiresIn: '12h' }
      );
      const refreshToken = jwt.sign(
        { userId: user._id, tenantId: user.tenantId, roleId: user.roleId },
        process.env.JWT_SECRET || 'super_secret_enterprise_key_2026',
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        message: 'Login successful',
        token,
        refreshToken,
        user: {
          _id: user._id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: 'ADMIN',
          tenantId: user.tenantId
        }
      });
    }

    
    console.log("Admin not found. Searching for Employee...");
    const employee = await Employee.findOne({ email, isActive: true });
    
    if (employee) {
      console.log("SUCCESS: Found Employee in Database!");
      
      const isPinValid = await bcrypt.compare(secretKey, employee.pinCode);
      console.log("Bcrypt PIN Match Result:", isPinValid);
      
      if (!isPinValid) {
        console.log("FAIL: PIN did not match!");
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      
      
const token = jwt.sign(
  { 
    userId: employee._id, 
    tenantId: employee.tenantId, 
    role: employee.role, 
    branchId: employee.branchId 
  },
  process.env.JWT_SECRET || 'super_secret_enterprise_key_2026',
  { expiresIn: '12h' }
);
      const refreshToken = jwt.sign(
        { id: employee._id, tenantId: employee.tenantId, role: employee.role, branchId: employee.branchId },
        process.env.JWT_SECRET || 'super_secret_enterprise_key_2026',
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        message: 'Login successful',
        token,
        refreshToken,
        user: {
          _id: employee._id,
          name: employee.name,
          email: employee.email,
          role: employee.role,
          tenantId: employee.tenantId
        }
      });
    }

    console.log("FAIL: Could not find user or employee with that email.");
    return res.status(401).json({ error: 'Invalid credentials or inactive account.' });

  } catch (error: any) {
    console.error("CRITICAL ERROR:", error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
};


export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: 'Refresh token required.' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'super_secret_enterprise_key_2026') as any;

    
    
    const payload = {
      userId: decoded.userId || decoded.id, 
      id: decoded.userId || decoded.id, 
      tenantId: decoded.tenantId,
      role: decoded.role,
      branchId: decoded.branchId
    };

    const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET || 'super_secret_enterprise_key_2026', { expiresIn: '12h' });

    res.status(200).json({ token: newAccessToken });
  } catch (error) {
    res.status(403).json({ error: 'Session expired. Please log in again.' });
  }
};