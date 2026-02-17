import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryLedger extends Document {
  tenantId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  warehouseId: mongoose.Types.ObjectId; 
  adjustment: number; 
  previousStock: number;
  newStock: number;
  reason: 'RECEIVE' | 'DAMAGE' | 'CORRECTION' | 'SALE' | 'RETURN';
  notes?: string;
  userId?: mongoose.Types.ObjectId; 
}

const InventoryLedgerSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true, index: true },
  adjustment: { type: Number, required: true },
  previousStock: { type: Number, required: true },
  newStock: { type: Number, required: true },
  reason: { type: String, enum: ['RECEIVE', 'DAMAGE', 'CORRECTION', 'SALE', 'RETURN'], required: true },
  notes: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: 'User' } 
}, { timestamps: true });

export default mongoose.model<IInventoryLedger>('InventoryLedger', InventoryLedgerSchema);