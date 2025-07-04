import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  permissions: string[]; 
}

const RoleSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  name: { type: String, required: true },
  permissions: [{ type: String, required: true }]
}, { timestamps: true });

export default mongoose.model<IRole>('Role', RoleSchema);