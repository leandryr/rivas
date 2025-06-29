// File: src/app/api/admin/expenses/finance/summary/route.ts
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Payment } from '@/models/Payment'
import Expense from '@/models/Expense.model'

export async function GET() {
  // Connect to the database
  await connectDB()

  // 1) Total invoices paid = sum of quote.total for each Payment
  const revenueAgg = await Payment.aggregate([
    {
      $lookup: {
        from: 'quotes',         // quotes collection
        localField: 'quote',    // field in Payment
        foreignField: '_id',    // field in Quote
        as: 'quoteDoc',
      },
    },
    { $unwind: '$quoteDoc' },
    {
      $group: {
        _id: null,
        totalPaid: { $sum: '$quoteDoc.total' },
      },
    },
  ])
  const totalPaid = revenueAgg[0]?.totalPaid ?? 0

  // 2) Total expenses
  const expenseDocs = (await Expense.find({ type: 'Expense' })
    .select('amount')
    .lean()) as { amount: number }[]
  const totalExpenses = expenseDocs.reduce((sum, e) => sum + e.amount, 0)

  // 3) Total investments
  const investmentDocs = (await Expense.find({ type: 'Investment' })
    .select('amount')
    .lean()) as { amount: number }[]
  const totalInvestments = investmentDocs.reduce((sum, e) => sum + e.amount, 0)

  // 4) Available balance (netProfit)
  const netProfit = totalPaid - totalExpenses - totalInvestments

  return NextResponse.json({
    success: true,
    data: {
      totalPaid,
      totalExpenses,
      totalInvestments,
      netProfit,
    },
  })
}
