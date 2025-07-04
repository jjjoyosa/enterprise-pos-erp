import mongoose, { Schema, Document } from 'mongoose';

export interface ITenant extends Document {
  name: string;
  tradeName?: string;
  tin: string;
  vatType: 'VAT' | 'NON-VAT' | 'ZERO-RATED';
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema({
  name: { type: String, required: true },
  tradeName: { type: String },
  tin: { type: String, required: true, unique: true },
  vatType: { type: String, enum: ['VAT', 'NON-VAT', 'ZERO-RATED'], default: 'NON-VAT' },
  status: { type: String, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
}, { timestamps: true });

export default mongoose.model<ITenant>('Tenant', TenantSchema);