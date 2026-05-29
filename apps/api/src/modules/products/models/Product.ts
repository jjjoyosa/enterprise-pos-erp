import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  tenantId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  basePrice: number;
  costPrice: number;
  trackInventory: boolean;
  hasVariants: boolean;
  status: 'ACTIVE' | 'ARCHIVED';
  stockQuantity: number;
  imageUrl?: string; 
  supplierId?: mongoose.Types.ObjectId;
}

const ProductSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  name: { type: String, required: true },
  description: { type: String },
  sku: { type: String, required: true },
  barcode: { type: String },
  basePrice: { type: Number, required: true, min: 0 },
  costPrice: { type: Number, required: true, min: 0 },
  trackInventory: { type: Boolean, default: true },
  hasVariants: { type: Boolean, default: false },
  status: { type: String, enum: ['ACTIVE', 'ARCHIVED'], default: 'ACTIVE' },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  stockQuantity: { type: Number, default: 0 },
  imageUrl: { type: String } ,
  supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: false },
}, { timestamps: true });

ProductSchema.index({ tenantId: 1, sku: 1 }, { unique: true });
ProductSchema.index(
  { tenantId: 1, barcode: 1 }, 
  { unique: true, partialFilterExpression: { barcode: { $type: "string" } } }
);

export default mongoose.model<IProduct>('Product', ProductSchema);