import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_enterprise_key_2026';


declare global {
  namespace Express {
    interface Request {
      userId?: string;
      tenantId?: string;
      roleId?: string;
      user?: any; 
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    
    const userId = decoded.userId || decoded.id;
    const tenantId = decoded.tenantId;

    
    console.log("MIDDLEWARE: Decoded Token Payload ->", decoded);
    console.log("MIDDLEWARE: Extracted TenantID ->", tenantId);

    if (!userId || !tenantId) {
      return res.status(401).json({ error: 'Unauthorized: Missing identity or tenant context inside token' });
    }

    
    req.userId = userId;
    req.tenantId = tenantId;
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};