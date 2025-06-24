// src/app/api/subscribe/route.ts
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Subscriber } from '@/models/Subscriber'
import { z } from 'zod'

const bodySchema = z.object({ email: z.string().email() })

export async function POST(req: Request) {
  await connectDB()

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parse = bodySchema.safeParse(json)
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }
  const { email } = parse.data

  try {
    await Subscriber.create({ email })
  } catch (e: any) {
    if (e.code === 11000) {
      // ya suscrito
      return NextResponse.json({ message: 'Ya estás suscrito' })
    }
    throw e
  }

  return NextResponse.json({ message: '¡Suscripción confirmada!' })
}
