// src/app/api/client/invoices/route.ts
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Invoice } from '@/models/Invoice'
import User from '@/models/User'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth'

export async function GET() {
  await connectDB()
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) 
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dbUser = await User.findOne({ email: session.user.email }).select('_id')
  const invoices = await Invoice.find({ client: dbUser!._id })
    .sort({ invoiceNumber: -1 })
    .select('_id invoiceNumber invoiceDate total')
  return NextResponse.json(invoices)
}
