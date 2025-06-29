// src/app/api/users/save-payment-method/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db'
import User from '@/models/User'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil', // Versión estable compatible actual (evita usar futuras como '2025-05-28.basil')
})

export async function POST(req: Request) {
  try {
    const { paymentMethodId } = await req.json()

    if (!paymentMethodId) {
      return NextResponse.json({ error: 'Missing paymentMethodId' }, { status: 400 })
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const user = await User.findOne({ email: session.user.email })

    if (!user || !user.stripeCustomerId) {
      return NextResponse.json({ error: 'User or Stripe customer not found' }, { status: 404 })
    }

    // 🔐 Adjuntar el método de pago al cliente
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: user.stripeCustomerId,
    })

    // ⭐ Establecer como método de pago predeterminado
    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })

    // 🔎 Obtener detalles del método
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)

    // 💾 Guardar en la base de datos
    user.hasValidPaymentMethod = true
    user.paymentMethodDetails = {
      last4: paymentMethod.card?.last4 || '',
      brand: paymentMethod.card?.brand || '',
      exp_month: paymentMethod.card?.exp_month || 0,
      exp_year: paymentMethod.card?.exp_year || 0,
    }

    await user.save()

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Save payment method error:', err.message || err)
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
