import mongoose, { Schema, Document } from 'mongoose';

export interface IZReading extends Document {
  tenantId: mongoose.Types.ObjectId;
  shiftId: mongoose.Types.ObjectId;
  cashierId: mongoose.Types.ObjectId;
  zReceiptNumber: string;
  grossSales: number;
  netSales: number;
  totalTax: number;
  totalDiscounts: number;
  startingCash: number;
  totalPayIns: number;
  totalPayOuts: number;
  expectedCash: number;
  actualEndingCash: number;
  variance: number;
  createdAt: Date;
}

const ZReadingSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  shiftId: { type: Schema.Types.ObjectId, required: true },
  cashierId: { type: Schema.Types.ObjectId, required: true },
  zReceiptNumber: { type: String, required: true, unique: true },
  
  
  grossSales: { type: Number, default: 0 },
  netSales: { type: Number, default: 0 },
  totalTax: { type: Number, default: 0 },
  totalDiscounts: { type: Number, default: 0 },
  
  
  startingCash: { type: Number, required: true },
  totalPayIns: { type: Number, default: 0 },
  totalPayOuts: { type: Number, default: 0 },
  expectedCash: { type: Number, required: true },
  actualEndingCash: { type: Number, required: true },
  variance: { type: Number, required: true },
  
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IZReading>('ZReading', ZReadingSchema);