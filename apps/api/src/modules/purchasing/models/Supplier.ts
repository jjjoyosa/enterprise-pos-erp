import mongoose, { Schema, Document } from 'mongoose';

export interface ISupplier extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  tin?: string;
  paymentTerms: string;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true },
    contactPerson: { type: String },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    tin: { type: String }, 
    paymentTerms: { 
      type: String, 
      enum: ['CASH', 'NET_15', 'NET_30', 'NET_60', 'CUSTOM'], 
      default: 'CASH' 
    },
    isActive: { type: Boolean, default: true },
    notes: { type: String }
  },
  { timestamps: true }
);


SupplierSchema.index({ tenantId: 1, name: 1 }, { unique: true });

export default mongoose.model<ISupplier>('Supplier', SupplierSchema);