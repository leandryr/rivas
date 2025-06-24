import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth'
import dbConnect from '@/lib/db'
import User from '@/models/User'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

export async function GET() {
  await dbConnect()

  // 1) Autenticación
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2) Busca el usuario
  const user = await User.findOne({ email: session.user.email })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // 3) Crea o reutiliza su Stripe Express Account
  let accountId = user.stripeAccountId
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers:     { requested: true },
      },
    })
    accountId = account.id
    user.stripeAccountId     = accountId
    user.stripeAccountStatus = 'pending'
    await user.save()
  }

  // 4) Genera el Account Link
  const origin = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const link = await stripe.accountLinks.create({
    account:     accountId,
    refresh_url: `${origin}/client/verify?refresh=1`,
    return_url:  `${origin}/client/verify`,
    type:        'account_onboarding',
  })

  return NextResponse.json({ url: link.url })
}
