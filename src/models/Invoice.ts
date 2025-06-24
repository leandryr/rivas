// src/models/Invoice.ts
import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IInvoice extends Document {
  quote: Types.ObjectId
  client: Types.ObjectId
  items: {
    title: string
    price: number
    discount?: number
  }[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  invoiceNumber: number
  invoiceDate: Date
  createdAt: Date
  updatedAt: Date
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    quote:         { type: Schema.Types.ObjectId, ref: 'Quote', required: true },
    client:        { type: Schema.Types.ObjectId, ref: 'User',  required: true },
    items: [
      {
        title:    { type: String, required: true },
        price:    { type: Number, required: true },
        discount: { type: Number, default: 0 },
      },
    ],
    subtotal:      { type: Number, required: true },
    taxRate:       { type: Number, required: true },
    taxAmount:     { type: Number, required: true },
    total:         { type: Number, required: true },
    invoiceNumber: { type: Number, required: true, unique: true },
    invoiceDate:   { type: Date,   required: true },
  },
  { timestamps: true }
)

// Secuenciamiento de invoiceNumber: usa tu modelo Counter o similar
InvoiceSchema.pre<IInvoice>('validate', async function(next) {
  if (this.isNew) {
    // aquí debes incrementar un contador global; por simplicidad:
    const last = await mongoose
      .model<IInvoice>('Invoice')
      .findOne({}, {}, { sort: { invoiceNumber: -1 } })
    this.invoiceNumber = last ? last.invoiceNumber + 1 : 1
    this.invoiceDate   = new Date()
  }
  next()
})

export const Invoice = mongoose.models.Invoice
  || mongoose.model<IInvoice>('Invoice', InvoiceSchema)
