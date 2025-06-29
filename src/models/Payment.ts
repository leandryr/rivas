// src/models/Payment.ts
import mongoose, { Schema, Document, Types } from 'mongoose'
import { Counter } from './Counter'
import { IQuote, Quote } from './Quote'

export interface IPayment extends Document {
  quote: Types.ObjectId | IQuote
  method: 'cash' | 'cheque' | 'paypal' | 'stripe' | 'other'
  reference?: string
  createdAt: Date
  updatedAt: Date
}

const PaymentSchema = new Schema<IPayment>(
  {
    quote: { type: Schema.Types.ObjectId, ref: 'Quote', required: true },
    method: {
      type: String,
      enum: ['cash', 'cheque', 'paypal', 'stripe', 'other'],
      required: true,
    },
    reference: { type: String, default: null },
  },
  { timestamps: true }
)

// Opcional: correlativo de pagos
PaymentSchema.pre<IPayment>('save', async function (next) {
  if (this.isNew) {
    await Counter.findByIdAndUpdate(
      'paymentNumber',
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    )
  }
  next()
})

// **Post-save**: actualiza la cotización a `paid` y dispara sus hooks
PaymentSchema.post<IPayment>('save', async function (doc) {
  const quote = await Quote.findById(doc.quote)
  if (quote && quote.status !== 'paid') {
    quote.status = 'paid'
    await quote.save()    // dispara tus pre('save') de QuoteSchema
  }
})

PaymentSchema.index({ quote: 1, createdAt: -1 })

export const Payment =
  mongoose.models.Payment ||
  mongoose.model<IPayment>('Payment', PaymentSchema)
