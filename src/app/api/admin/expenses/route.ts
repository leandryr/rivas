// File: src/app/api/admin/expenses/route.ts
import { NextResponse, NextRequest } from 'next/server'
import connectDB from '@/lib/db'
import Expense from '@/models/Expense.model'

export async function GET() {
  await connectDB()
  const items = await Expense.find().sort({ date: -1 }).lean()
  return NextResponse.json({ success: true, data: items })
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { date, amount, type, description } = await req.json()

    if (!date || typeof amount !== 'number' || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const exp = await Expense.create({
      date: new Date(date),
      amount,
      type,
      description,
    })
    return NextResponse.json({ success: true, data: exp }, { status: 201 })
  } catch (err: any) {
    console.error('[POST /admin/expenses]', err)
    return NextResponse.json(
      { error: 'Error creating expense/investment' },
      { status: 500 }
    )
  }
}
