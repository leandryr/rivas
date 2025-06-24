import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db'
import User from '@/models/User'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

async function markPaymentVerified() {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await User.findOne({ email: session.user.email })
    if (!user || !user.stripeCustomerId) {
      return NextResponse.json({ error: 'User not found or missing Stripe customer ID' }, { status: 404 })
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card',
    })

    const defaultCard = paymentMethods.data[0]
    if (!defaultCard || defaultCard.type !== 'card' || !defaultCard.card) {
      return NextResponse.json({ error: 'No valid card found' }, { status: 400 })
    }

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

export const PATCH = markPaymentVerified
export const POST = markPaymentVerified
