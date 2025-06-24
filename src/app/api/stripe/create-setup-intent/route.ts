// src/app/api/stripe/setup_intent/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db'
import User from '@/models/User'
import Stripe from 'stripe'
import { Types } from 'mongoose'

const stripeSecret = process.env.STRIPE_SECRET_KEY
if (!stripeSecret) throw new Error('Missing STRIPE_SECRET_KEY')

const stripe = new Stripe(stripeSecret, {
  apiVersion: '2025-05-28.basil',
})

export async function POST(req: Request) {
  try {
    // 1) Conectar a la base de datos
    await connectDB()

    // 2) Validar sesión y obtener email
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 3) Buscar al usuario
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 4) Crear o reutilizar Stripe Customer
    const userId = (user._id as Types.ObjectId).toString()
    let customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.name}${user.lastname ? ` ${user.lastname}` : ''}`,
        metadata: { userId },
      })
      customerId = customer.id
      user.stripeCustomerId = customerId
      await user.save()
    }

    // 5) Generar el SetupIntent para registrar la tarjeta
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      usage: 'off_session',
    })

    // 6) Devolver el client_secret al frontend
    return NextResponse.json({ clientSecret: setupIntent.client_secret })
  } catch (err) {
    console.error('Stripe SetupIntent Error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
