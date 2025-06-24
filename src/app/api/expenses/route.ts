import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db'
import Expense from '@/models/Expense'
import User from '@/models/User'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    await connectDB()
    const user = await User.findOne({ email: session.user.email })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { amount, category, description } = await req.json()
    if (!amount || !category) {
      return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
    }

    const expense = await Expense.create({ amount, category, description })

    return NextResponse.json({ expense })
  } catch (error) {
    console.error('POST /api/expenses', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    await connectDB()
    const user = await User.findOne({ email: session.user.email })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const expenses = await Expense.find().sort({ createdAt: -1 })

    return NextResponse.json({ expenses })
  } catch (error) {
    console.error('GET /api/expenses', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
