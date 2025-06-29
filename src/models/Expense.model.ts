// File: src/models/Expense.model.ts
import mongoose, { Schema, Document, Model } from 'mongoose'

export type ExpenseType = 'Expense' | 'Investment'

export interface IExpense extends Document {
  date: Date
  amount: number
  type: ExpenseType
  description?: string
  createdAt: Date
  updatedAt: Date
}

const ExpenseSchema = new Schema<IExpense>(
  {
    date: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      required: true,
      enum: ['Expense', 'Investment'],
    },
    description: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
)

// Index by date to facilitate chronological queries
ExpenseSchema.index({ date: 1 })

const Expense: Model<IExpense> =
  mongoose.models.Expense ||
  mongoose.model<IExpense>('Expense', ExpenseSchema)

export default Expense
