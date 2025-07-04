import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  tenantId: mongoose.Types.ObjectId;
  branchIds: mongoose.Types.ObjectId[]; 
  roleId: mongoose.Types.ObjectId;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  pinCode?: string; 
  isActive: boolean;
}

const UserSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  branchIds: [{ type: Schema.Types.ObjectId, ref: 'Branch' }],
  roleId: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
  email: { type: String, required: true, lowercase: true },
  passwordHash: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  pinCode: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });


UserSchema.index({ tenantId: 1, email: 1 }, { unique: true });

export default mongoose.model<IUser>('User', UserSchema);