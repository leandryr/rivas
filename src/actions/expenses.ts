'use server'

import { authOptions } from '@/lib/auth/auth'
import { getServerSession } from 'next-auth'
import Expense from '@/models/Expense'
import connectDB from '@/lib/db'

interface ExpenseType {
  _id: string
  amount: number
  category: string
  description?: string
  createdAt: string
}

export async function getSummaryAndExpenses() {
  await connectDB()

  const totalExpenses = await Expense.aggregate([
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ])

  const rawExpenses = await Expense.find().sort({ createdAt: -1 }).lean()

  const expenses: ExpenseType[] = rawExpenses.map((e: any) => ({
    _id: e._id.toString(),
    amount: e.amount,
    category: e.category,
    description: e.description,
    createdAt: e.createdAt.toISOString(),
  }))

  return {
    summary: {
      totalIncome: 10000,
      totalExpenses: totalExpenses[0]?.total || 0,
      netProfit: 10000 - (totalExpenses[0]?.total || 0),
    },
    expenses,
  }
}

export async function registerExpense(form: { amount: string, category: string, description: string }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    return { success: false, error: 'No autorizado' }
  }

  try {
    await connectDB()
    await Expense.create({
      amount: parseFloat(form.amount),
      category: form.category,
      description: form.description
    })
    return { success: true }
  } catch (err: any) {
    console.error('registerExpense error', err)
    return { success: false, error: err.message }
  }
}
