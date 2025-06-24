import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import dbConnect from '@/lib/db'
import User from '@/models/User'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

export async function POST() {
  await dbConnect()
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await User.findOne({ email: session.user.email })
  if (!user?.stripeAccountId) {
    return NextResponse.json({ error: 'Stripe account not found' }, { status: 404 })
  }

  const account = await stripe.accounts.retrieve(user.stripeAccountId)

  const status: 'verified' | 'pending' | 'rejected' | 'disabled' =
    account.charges_enabled && account.details_submitted
      ? 'verified'
      : 'pending'

  user.stripeAccountStatus = status
  await user.save()

  return NextResponse.json({ updated: true, status })
}
