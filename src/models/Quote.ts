import mongoose, { Schema, Document, Types } from 'mongoose';
import { Counter } from './Counter';

interface QuoteItem {
  title: string;
  price: number;
  discount?: number;  // porcentaje
}

export interface IQuote extends Document {
  client: Types.ObjectId;
  items: QuoteItem[];
  subtotal: number;    // sin impuestos
  taxRate: number;     // e.g. 0.07 para GA
  taxAmount: number;   // subtotal * taxRate
  total: number;       // subtotal + taxAmount
  notes?: string;
  validUntil: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'paid';
  invoiceNumber?: number;
  invoiceDate?: Date;
  paidAt?: Date;
  paymentIntentId?: string;
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuoteSchema = new Schema<IQuote>(
  {
    client:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      { title: { type: String, required: true }, price: { type: Number, required: true }, discount: { type: Number, default: 0 } },
    ],
    subtotal:      { type: Number, required: true, default: 0 },
    taxRate:       { type: Number, required: true, default: 0.07 },
    taxAmount:     { type: Number, required: true, default: 0 },
    total:         { type: Number, required: true, default: 0 },
    notes:         { type: String },
    validUntil:    { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending','accepted','rejected','paid'],
      default: 'pending',
    },
    invoiceNumber:   { type: Number, unique: true, sparse: true },
    invoiceDate:     Date,
    paidAt:          Date,
    paymentIntentId: String,
    pdfUrl:          String,
  },
  { timestamps: true }
);

// Recalcula subtotal, impuesto y total
QuoteSchema.pre<IQuote>('validate', function(next) {
  const sub = this.items.reduce((sum, i) => sum + i.price * (1 - (i.discount ?? 0) / 100), 0);
  this.subtotal  = parseFloat(sub.toFixed(2));
  this.taxAmount = parseFloat((sub * this.taxRate).toFixed(2));
  this.total     = parseFloat((sub + this.taxAmount).toFixed(2));
  next();
});

// Al marcar 'paid', genera correlativo y fechas
QuoteSchema.pre<IQuote>('save', async function(next) {
  if (this.isModified('status') && this.status === 'paid' && !this.invoiceNumber) {
    const counter = await Counter.findByIdAndUpdate(
      'invoiceNumber',
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.invoiceNumber = counter.seq;
    this.invoiceDate   = new Date();
    this.paidAt        = new Date();
  }
  next();
});

QuoteSchema.index({ client: 1, status: 1, createdAt: -1 });

export const Quote = mongoose.models.Quote
  || mongoose.model<IQuote>('Quote', QuoteSchema);
