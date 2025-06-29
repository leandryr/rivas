import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db'
import User from '@/models/User'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil', // Puedes mantener esto actualizado según tus necesidades
})

export async function PATCH() {
  try {
    await connectDB()

    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await User.findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Crear cliente en Stripe si no existe uno
    if (!user.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || '',
      })
      user.stripeCustomerId = customer.id
      await user.save()
    }

    // Buscar métodos de pago para el cliente
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card',
    })

    const defaultCard = paymentMethods.data[0]
    if (!defaultCard || !defaultCard.card) {
      return NextResponse.json({ error: 'No valid card found' }, { status: 400 })
    }

    // Actualizar el usuario en base de datos
    user.hasValidPaymentMethod = true
    user.paymentMethodDetails = {
      last4: defaultCard.card.last4,
      brand: defaultCard.card.brand,
      exp_month: defaultCard.card.exp_month,
      exp_year: defaultCard.card.exp_year,
    }

    await user.save()

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Mark payment verified error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
