import mongoose, { Schema, Document } from 'mongoose';

export interface ISequence extends Document {
  tenantId: mongoose.Types.ObjectId;
  type: string; 
  sequence_value: number;
}

const SequenceSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  type: { type: String, required: true },
  sequence_value: { type: Number, default: 0 }
});


SequenceSchema.index({ tenantId: 1, type: 1 }, { unique: true });

export default mongoose.model<ISequence>('Sequence', SequenceSchema);