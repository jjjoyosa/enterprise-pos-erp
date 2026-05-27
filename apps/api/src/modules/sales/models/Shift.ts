import mongoose, { Schema, Document } from 'mongoose';


export interface ICashMovement {
  type: 'PAY_IN' | 'PAY_OUT';
  amount: number;
  reason: string;
  timestamp: Date;
}

export interface IShift extends Document {
  tenantId: mongoose.Types.ObjectId;
  cashierId: mongoose.Types.ObjectId;
  warehouseId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  startingCash: number;
  expectedCash: number;
  endingCash?: number;
  totalTransactions: number;
  actualCash?: number;
  status: 'OPEN' | 'CLOSED';
  notes?: string;
  cashMovements: ICashMovement[]; 
}

const ShiftSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
    cashierId: { type: Schema.Types.ObjectId, required: true },
    warehouseId: { type: Schema.Types.ObjectId, required: true },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    startingCash: { type: Number, required: true },
    expectedCash: { type: Number, default: 0 },
    endingCash: { type: Number },
    status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' },
    actualCash: { type: Number },
    totalTransactions: { type: Number, default: 0 },
    notes: { type: String },
    
    
    cashMovements: [{
      type: { type: String, enum: ['PAY_IN', 'PAY_OUT'], required: true },
      amount: { type: Number, required: true },
      reason: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

ShiftSchema.index(
  { cashierId: 1, status: 1 }, 
  { unique: true, partialFilterExpression: { status: 'OPEN' } }
);

export default mongoose.model<IShift>('Shift', ShiftSchema);