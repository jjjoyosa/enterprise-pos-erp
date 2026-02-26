import mongoose, { Schema, Document } from 'mongoose';

export interface IDiscountRule extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number; // e.g., 10 for 10%, or 500 for ₱500 off
  target: 'ENTIRE_CART' | 'SPECIFIC_ITEM';
  targetProductId?: mongoose.Types.ObjectId; // Only needed if target is SPECIFIC_ITEM
  minPurchaseAmount?: number; // E.g., Must spend ₱1000 to use
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
}

const DiscountRuleSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['PERCENTAGE', 'FIXED_AMOUNT'], required: true },
  value: { type: Number, required: true, min: 0 },
  target: { type: String, enum: ['ENTIRE_CART', 'SPECIFIC_ITEM'], default: 'ENTIRE_CART' },
  targetProductId: { type: Schema.Types.ObjectId, ref: 'Product' },
  minPurchaseAmount: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true },
  startDate: { type: Date },
  endDate: { type: Date }
}, { timestamps: true });

export default mongoose.model<IDiscountRule>('DiscountRule', DiscountRuleSchema);