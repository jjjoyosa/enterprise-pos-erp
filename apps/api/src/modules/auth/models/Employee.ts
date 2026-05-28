import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
  tenantId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  pinCode: string; 
  role: 'CASHIER' | 'MANAGER' | 'ADMIN';
  isActive: boolean;
}

const EmployeeSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
    branchId: { type: Schema.Types.ObjectId },
    name: { type: String, required: true },
    email: { type: String, required: true },
    pinCode: { type: String, required: true }, 
    role: { type: String, enum: ['CASHIER', 'MANAGER', 'ADMIN'], default: 'CASHIER' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);


EmployeeSchema.index({ tenantId: 1, email: 1 }, { unique: true });

export default mongoose.model<IEmployee>('Employee', EmployeeSchema);