import mongoose, { Schema, Document } from 'mongoose';

export interface IStockMovement extends Document {
  tenantId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  warehouseId: mongoose.Types.ObjectId;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reference: string; 
  notes?: string;
}

const StockMovementSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  type: { type: String, enum: ['IN', 'OUT', 'ADJUSTMENT'], required: true },
  quantity: { type: Number, required: true }, 
  reference: { type: String, required: true },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.model<IStockMovement>('StockMovement', StockMovementSchema);