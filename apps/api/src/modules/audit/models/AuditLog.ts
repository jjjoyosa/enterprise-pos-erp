import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  tenantId: mongoose.Types.ObjectId;
  actorName: string;      
  actorRole: string;      
  actionType: string;     
  targetEntity?: string;  
  targetId?: string;      
  details: string;        
  createdAt: Date;
}

const AuditLogSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
    actorName: { type: String, required: true },
    actorRole: { type: String, required: true },
    actionType: { type: String, required: true, index: true },
    targetEntity: { type: String },
    targetId: { type: String },
    details: { type: String, required: true },
  },
  { 
    timestamps: { createdAt: true, updatedAt: false } 
  }
);


AuditLogSchema.index({ tenantId: 1, createdAt: -1 });

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);