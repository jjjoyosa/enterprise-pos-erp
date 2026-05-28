import { Request, Response } from 'express';
import Tenant from '../../organizations/models/Tenant';
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

    const hashedPassword = await hashPassword(password);
    
    
    const newUser = await User.create({
      tenantId: newTenant._id,
      role: 'ADMIN', 
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
    const { email, password, pinCode } = req.body;
    const secretKey = password || pinCode;

    if (!email || !secretKey) {
      return res.status(400).json({ error: 'Email and Password/PIN are required.' });
    }

    
    const user = await User.findOne({ email, isActive: true });
    
    if (user) {
      const isMatch = await bcrypt.compare(secretKey, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      
      const token = jwt.sign(
        { userId: user._id, tenantId: user.tenantId, role: user.role },
        JWT_SECRET,
        { expiresIn: '12h' }
      );
      const refreshToken = jwt.sign(
        { userId: user._id, tenantId: user.tenantId, role: user.role },
        JWT_SECRET,
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
          role: user.role,
          tenantId: user.tenantId
        }
      });
    }

    
    const employee = await Employee.findOne({ email, isActive: true });
    
    if (employee) {
      const isPinValid = await bcrypt.compare(secretKey, employee.pinCode);
      if (!isPinValid) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      const token = jwt.sign(
        { 
          userId: employee._id, 
          tenantId: employee.tenantId, 
          role: employee.role, 
          branchId: employee.branchId 
        },
        JWT_SECRET,
        { expiresIn: '12h' }
      );
      const refreshToken = jwt.sign(
        { id: employee._id, tenantId: employee.tenantId, role: employee.role, branchId: employee.branchId },
        JWT_SECRET,
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

    const decoded = jwt.verify(refreshToken, JWT_SECRET) as any;

    const payload = {
      userId: decoded.userId || decoded.id, 
      id: decoded.userId || decoded.id, 
      tenantId: decoded.tenantId,
      role: decoded.role,
      branchId: decoded.branchId
    };

    const newAccessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });

    res.status(200).json({ token: newAccessToken });
  } catch (error) {
    res.status(403).json({ error: 'Session expired. Please log in again.' });
  }
};