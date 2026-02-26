import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_enterprise_key_2026';

// Extend Express Request so TypeScript stops yelling at us
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      tenantId?: string;
      roleId?: string;
      user?: any; // Attach the raw object just in case controllers need it
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // --- THE CRITICAL FIX ---
    // Grab the ID whether it's named 'userId' (Admin) or 'id' (Cashier)
    req.userId = decoded.userId || decoded.id || decoded._id;
    
    req.tenantId = decoded.tenantId; 
    req.roleId = decoded.roleId || decoded.role;
    req.user = decoded; // Attach the whole payload for maximum compatibility
    
    if (!req.userId || !req.tenantId) {
       console.log("Middleware dropped identity:", decoded);
       return res.status(401).json({ error: 'Unauthorized: Missing identity or tenant context inside token' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};