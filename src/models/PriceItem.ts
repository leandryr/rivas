import mongoose, { Schema, Document } from 'mongoose';

export interface IPriceItem extends Document {
  title: string;
  description?: string;
  category: string;
  subcategory?: string;
  price: number;
  unit?: string;
  discount?: number;
  tags?: string[];
  isActive: boolean;
  createdBy: string;
}

const PriceItemSchema = new Schema<IPriceItem>(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category:    { type: String, required: true, trim: true },
    subcategory: { type: String, trim: true },
    price:       { type: Number, required: true },
    unit: {
      type: String,
      enum: ['hour', 'project', 'page', 'unit', 'month', 'custom'],
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    tags:     { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    createdBy: { type: String, required: true }, // admin email
  },
  { timestamps: true }
);

export default mongoose.models.PriceItem || mongoose.model<IPriceItem>('PriceItem', PriceItemSchema);
