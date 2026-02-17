import mongoose, { Schema, Document } from 'mongoose';

export interface Category extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  parentId?: mongoose.Types.ObjectId; 
}

const CategorySchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  name: { type: String, required: true },
  description: { type: String },
  parentId: { type: Schema.Types.ObjectId, ref: 'Category', default: null }
}, { timestamps: true });


CategorySchema.index({ tenantId: 1, name: 1 }, { unique: true });

export default mongoose.model<Category>('Category', CategorySchema);