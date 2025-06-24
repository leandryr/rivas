// src/app/api/admin/invoices/route.ts
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Invoice } from '@/models/Invoice'

export async function GET() {
  await connectDB()
  // Trae todas las facturas, con info del cliente
  const invoices = await Invoice.find()
    .populate('client', 'name email')
    .sort({ invoiceNumber: -1 })
  return NextResponse.json(invoices)
}
