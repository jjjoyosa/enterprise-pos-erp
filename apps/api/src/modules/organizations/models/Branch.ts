import mongoose, { Schema, Document } from 'mongoose';

export interface IBranch extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  address: string;
  status: 'OPEN' | 'CLOSED';
}

const BranchSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  address: { type: String, required: true },
  status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' },
}, { timestamps: true });


BranchSchema.index({ tenantId: 1, code: 1 }, { unique: true });

export default mongoose.model<IBranch>('Branch', BranchSchema);