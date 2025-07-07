import mongoose, { Schema, Document } from 'mongoose';

export interface IInventory extends Document {
  tenantId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  warehouseId: mongoose.Types.ObjectId;
  quantity: number;
}

const InventorySchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  quantity: { type: Number, required: true, default: 0 }
}, { timestamps: true });


InventorySchema.index({ tenantId: 1, productId: 1, warehouseId: 1 }, { unique: true });

export default mongoose.model<IInventory>('Inventory', InventorySchema);