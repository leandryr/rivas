// src/app/api/stripe/create-setup-intent/route.ts

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import dbConnect from '@/lib/db'
import User from '@/models/User'
import Stripe from 'stripe'
import { Types } from 'mongoose'

//  ❌ Esto causaba el error de TS:
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2022-11-15',
// });

// ✅ En su lugar, basta con no pasar apiVersion:
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST() {
  try {
    await dbConnect()
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Cast explícito para evitar el “user._id is unknown”
    const userId = (user._id as Types.ObjectId).toString()

    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name + (user.lastname ? ` ${user.lastname}` : ''),
      metadata: {
        userId, // ya es string válido
      },
    })

    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      payment_method_types: ['card'],
    })

    return NextResponse.json({ clientSecret: setupIntent.client_secret })
  } catch (err: any) {
    console.error('Stripe SetupIntent Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
