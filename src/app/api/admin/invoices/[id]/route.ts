// src/app/api/admin/invoices/[id]/route.ts
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Invoice } from '@/models/Invoice'
import { Types } from 'mongoose'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB()
  const { id } = params
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }
  const inv = await Invoice.findById(id)
    .populate('client', 'name email')
    .populate('quote', 'items subtotal taxAmount total')
  if (!inv) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(inv)
}
