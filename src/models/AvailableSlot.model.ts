import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAvailableSlot extends Document {
  adminId: string;
  availability: {
    day: string;
    hours: string[];
  }[];
}

const AvailableSlotSchema = new Schema<IAvailableSlot>(
  {
    adminId: { type: String, required: true, unique: true },
    availability: [
      {
        day: { type: String, required: true },
        hours: [{ type: String, required: true }],
      },
    ],
  },
  { timestamps: true }
);

const AvailableSlot: Model<IAvailableSlot> =
  mongoose.models.AvailableSlot || mongoose.model('AvailableSlot', AvailableSlotSchema);

export default AvailableSlot;
