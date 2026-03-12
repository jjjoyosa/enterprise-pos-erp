import mongoose, { Schema, Document } from 'mongoose';

export interface IPOItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  unitCost: number; 
  total: number;
}

export interface IPurchaseOrder extends Document {
  tenantId: mongoose.Types.ObjectId;
  supplierId: mongoose.Types.ObjectId;
  poNumber: string; 
  status: 'DRAFT' | 'APPROVED' | 'SENT' | 'COMPLETED' | 'CANCELLED';
  expectedDeliveryDate?: Date;
  items: IPOItem[];
  totalAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const POItemSchema = new Schema<IPOItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitCost: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 }
});

const PurchaseOrderSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    poNumber: { type: String, required: true, unique: true },
    status: { 
      type: String, 
      enum: ['DRAFT', 'APPROVED', 'SENT', 'COMPLETED', 'CANCELLED'], 
      default: 'DRAFT' 
    },
    expectedDeliveryDate: { type: Date },
    items: [POItemSchema],
    totalAmount: { type: Number, required: true, default: 0 },
    notes: { type: String }
  },
  { timestamps: true }
);


PurchaseOrderSchema.index({ tenantId: 1, poNumber: 1 }, { unique: true });
PurchaseOrderSchema.index({ tenantId: 1, status: 1 });

export default mongoose.model<IPurchaseOrder>('PurchaseOrder', PurchaseOrderSchema);