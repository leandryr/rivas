// src/app/api/admin/quotes/[id]/pay/route.ts

import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { Quote } from '@/models/Quote'
import { Payment } from '@/models/Payment'

interface Body {
  method: 'cash' | 'cheque' | 'paypal' | 'stripe' | 'other'
  reference?: string
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1) Conectar a la base de datos
  await dbConnect()

  const { id } = params
  const { method, reference } = (await req.json()) as Body

  // 2) Crear el registro de pago
  await Payment.create({ quote: id, method, reference })

  // 3) Marcar la cotización como 'paid' y disparar sus hooks
  const quote = await Quote.findById(id)
  if (!quote) {
    return NextResponse.json(
      { error: 'Cotización no encontrada' },
      { status: 404 }
    )
  }
  quote.status = 'paid'
  await quote.save() // dispara el pre-save de QuoteSchema (invoiceNumber, invoiceDate, paidAt)

  // 4) Devolver la cotización actualizada
  return NextResponse.json({
    _id:           quote._id.toString(),
    subtotal:      quote.subtotal,
    taxAmount:     quote.taxAmount,
    total:         quote.total,
    status:        quote.status,
    validUntil:    quote.validUntil.toISOString(),
    createdAt:     quote.createdAt.toISOString(),
    invoiceNumber: quote.invoiceNumber,
    invoiceDate:   quote.invoiceDate?.toISOString(),
    paidAt:        quote.paidAt?.toISOString(),
  })
}
