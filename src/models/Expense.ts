import mongoose, { Schema, model, models } from 'mongoose'

const ExpenseSchema = new Schema({
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
})

export default models.Expense || model('Expense', ExpenseSchema)
