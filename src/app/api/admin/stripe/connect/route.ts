import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import dbConnect from '@/lib/db'
import User from '@/models/User'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

export async function GET() {
  await dbConnect()
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await User.findOne({ email: session.user.email })
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
  }

  // Si ya tiene cuenta Stripe, no crear una nueva
  let accountId = user.stripeAccountId
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      email: user.email,
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
      },
    })

    user.stripeAccountId = account.id
    user.stripeAccountStatus = 'pending'
    await user.save()

    accountId = account.id
  }

  const origin = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/admin/verify?refresh=1`,
    return_url: `${origin}/admin/verify`,
    type: 'account_onboarding',
  })

  return NextResponse.json({ url: link.url })
}
