import mongoose, { Schema, Document } from 'mongoose';

export interface ICounter extends Document {
  _id: string;   // "invoiceNumber"
  seq: number;
}

const counterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export const Counter = mongoose.models.Counter
  || mongoose.model<ICounter>('Counter', counterSchema);
