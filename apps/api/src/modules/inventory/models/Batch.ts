import mongoose, { Schema, Document } from 'mongoose';

export interface IBatch extends Document {
  tenantId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  receivingReportId?: mongoose.Types.ObjectId;
  batchNumber: string; 
  expirationDate?: Date; 
  originalQuantity: number;
  currentQuantity: number;
  status: 'ACTIVE' | 'DEPLETED' | 'EXPIRED' | 'RECALLED';
  createdAt: Date;
  updatedAt: Date;
}

const BatchSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    receivingReportId: { type: Schema.Types.ObjectId, ref: 'ReceivingReport' },
    batchNumber: { type: String, required: true },
    expirationDate: { type: Date },
    originalQuantity: { type: Number, required: true, min: 0 },
    currentQuantity: { type: Number, required: true, min: 0 },
    status: { 
      type: String, 
      enum: ['ACTIVE', 'DEPLETED', 'EXPIRED', 'RECALLED'], 
      default: 'ACTIVE' 
    }
  },
  { timestamps: true }
);


BatchSchema.index({ tenantId: 1, productId: 1, batchNumber: 1 }, { unique: true });


BatchSchema.index({ tenantId: 1, productId: 1, status: 1, expirationDate: 1 });

export default mongoose.model<IBatch>('Batch', BatchSchema);