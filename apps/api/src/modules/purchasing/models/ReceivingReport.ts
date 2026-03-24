import mongoose, { Schema, Document } from 'mongoose';

export interface IReceivedItem {
  productId: mongoose.Types.ObjectId;
  expectedQty: number;
  actualQty: number;
  unitCost: number;
}

export interface IReceivingReport extends Document {
  tenantId: mongoose.Types.ObjectId;
  poId: mongoose.Types.ObjectId;
  supplierId: mongoose.Types.ObjectId;
  rrNumber: string; 
  items: IReceivedItem[];
  receivedBy: mongoose.Types.ObjectId; 
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReceivedItemSchema = new Schema<IReceivedItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  expectedQty: { type: Number, required: true },
  actualQty: { type: Number, required: true },
  unitCost: { type: Number, required: true } 
});

const ReceivingReportSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    poId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    rrNumber: { type: String, required: true },
    items: [ReceivedItemSchema],
    receivedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String }
  },
  { timestamps: true }
);

ReceivingReportSchema.index({ tenantId: 1, rrNumber: 1 }, { unique: true });

export default mongoose.model<IReceivingReport>('ReceivingReport', ReceivingReportSchema);