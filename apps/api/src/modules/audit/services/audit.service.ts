import AuditLog from '../models/AuditLog';
import { Types } from 'mongoose';

interface AuditLogParams {
  tenantId: string | Types.ObjectId;
  actorName: string;
  actorRole: string;
  actionType: string;
  targetEntity?: string;
  targetId?: string;
  details: string;
}

export const logAuditEvent = async (params: AuditLogParams) => {
  try {
    await AuditLog.create(params);
  } catch (error) {
    
    
    console.error('CRITICAL: Failed to write to Audit Log', error);
  }
};