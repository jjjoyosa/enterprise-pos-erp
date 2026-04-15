import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  tenantId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  totalVisits: number;
  lifetimeValue: number;
  loyaltyPoints: number;
  status: 'ACTIVE' | 'INACTIVE';
}

const customerSchema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    totalVisits: { type: Number, default: 0, min: 0 },
    lifetimeValue: { type: Number, default: 0, min: 0 },
    loyaltyPoints: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

customerSchema.index({ tenantId: 1, firstName: 'text', lastName: 'text', phone: 'text' });

export default mongoose.model<ICustomer>('Customer', customerSchema);