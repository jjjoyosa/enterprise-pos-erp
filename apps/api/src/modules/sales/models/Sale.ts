import mongoose, { Schema, Document } from 'mongoose';

export interface ISaleItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface ISale extends Document {
  tenantId: mongoose.Types.ObjectId;
  warehouseId: mongoose.Types.ObjectId;
  cashierId: mongoose.Types.ObjectId;
  shiftId: mongoose.Types.ObjectId; 
  receiptNumber: string;
  items: ISaleItem[];
  subtotal: number; 
  tax: number;
  discount: number;
  total: number; 
  paymentMethod: 'CASH' | 'CARD' | 'GCASH' | 'MAYA';
  // THE FIX: Added refund statuses and notes
  status: 'COMPLETED' | 'VOIDED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  notes?: string;
}

const SaleItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0 }
});

const SaleSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  cashierId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  shiftId: { type: Schema.Types.ObjectId, ref: 'Shift', required: true }, 
  receiptNumber: { type: String, required: true },
  items: [SaleItemSchema],
  subtotal: { type: Number, required: true, min: 0 },
  tax: { type: Number, default: 0, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  total: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, enum: ['CASH', 'CARD', 'GCASH', 'MAYA'], required: true },
  // THE FIX: Updated the enum array and added the notes property
  status: { 
    type: String, 
    enum: ['COMPLETED', 'VOIDED', 'REFUNDED', 'PARTIALLY_REFUNDED'], 
    default: 'COMPLETED' 
  },
  notes: { 
    type: String, 
    required: false 
  }
}, { timestamps: true });

SaleSchema.index({ tenantId: 1, receiptNumber: 1 }, { unique: true });

export default mongoose.model<ISale>('Sale', SaleSchema);