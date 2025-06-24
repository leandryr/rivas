// src/app/api/client/quotes/[id]/pay/route.ts
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Quote } from '@/models/Quote'
import { Invoice } from '@/models/Invoice'
import User from '@/models/User'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth'
import { Types } from 'mongoose'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB()

  // 1️⃣ Autenticación
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2️⃣ Usuario de Mongo real
  const dbUser = await User
    .findOne({ email: session.user.email })
    .select('_id')
  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // 3️⃣ Validar ID de la cotización
  const { id } = await context.params
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid quote ID' }, { status: 400 })
  }

  // 4️⃣ Recuperar cotización y validar estado
  const quote = await Quote.findOne({ _id: id, client: dbUser._id })
  if (!quote) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
  }
  if (quote.status !== 'accepted') {
    return NextResponse.json(
      { error: 'Only accepted quotes can be paid' },
      { status: 400 }
    )
  }

  // 5️⃣ Construir line_items tipados para Stripe
  interface LineItemInput {
    title: string
    price: number
    discount?: number
  }
  const items = quote.items as LineItemInput[]
  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =
    items.map((i: LineItemInput) => ({
      price_data: {
        currency: 'usd',
        product_data: { name: i.title },
        unit_amount: Math.round(i.price * 100),
      },
      quantity: 1,
    }))

  // 6️⃣ Crear sesión de Stripe Checkout
  const checkout = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items,
    customer_email: session.user.email,
    metadata: { quoteId: quote._id.toString() },
    success_url: `${process.env.NEXTAUTH_URL}/client/quotes/${quote._id}?paid=1`,
    cancel_url:  `${process.env.NEXTAUTH_URL}/client/quotes/${quote._id}`,
  })

  // 7️⃣ Marcar cotización como pagada
  quote.status = 'paid'
  await quote.save()

  // 8️⃣ Crear documento Invoice en BD
  await Invoice.create({
    quote:      quote._id,
    client:     dbUser._id,
    items:      quote.items,
    subtotal:   quote.subtotal,
    taxRate:    quote.taxRate,
    taxAmount:  quote.taxAmount,
    total:      quote.total,
    // invoiceNumber e invoiceDate los pone el pre-validate hook
  })

  // 9️⃣ Devolver URL de redirección a Stripe
  return NextResponse.json({ url: checkout.url! })
}
