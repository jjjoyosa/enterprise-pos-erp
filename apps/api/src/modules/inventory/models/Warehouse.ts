import mongoose, { Schema, Document } from 'mongoose';

export interface IWarehouse extends Document {
  tenantId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  name: string;
  isDefault: boolean;
}

const WarehouseSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch' }, 
  name: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<IWarehouse>('Warehouse', WarehouseSchema);