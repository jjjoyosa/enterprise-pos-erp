import { Request, Response, NextFunction } from 'express';


declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
    }
  }
}

export const tenantContext = (req: Request, res: Response, next: NextFunction) => {
  
  
  const tenantId = req.headers['x-tenant-id'] as string;

  if (!tenantId) {
    return res.status(400).json({ 
      error: 'CRITICAL: Missing tenant context. x-tenant-id header is required for data isolation.' 
    });
  }

  req.tenantId = tenantId;
  next();
};