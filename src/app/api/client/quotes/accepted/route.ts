// src/app/api/client/quotes/accepted/route.ts
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Quote } from '@/models/Quote'
import User from '@/models/User'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'

export async function GET() {
  await connectDB()

  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json([], { status: 200 }) // 👈 sin error para frontend
  }

  const user = await User.findOne({ email: session.user.email }).select('_id')
  if (!user) {
    return NextResponse.json([], { status: 200 }) // 👈 sin error para frontend
  }

  const quotes = await Quote.find({
    client: user._id,
    status: 'accepted'
  })
    .sort({ createdAt: -1 })
    .select('_id total createdAt status estimateNumber')
    .lean()

  return NextResponse.json(quotes)
}
