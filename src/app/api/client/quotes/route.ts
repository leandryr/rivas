import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Quote } from '@/models/Quote'
import User from '@/models/User'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth'

export async function GET(request: Request) {
  await connectDB()

  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Buscamos el User de Mongo por email
    const dbUser = await User.findOne({ email: session.user.email }).select('_id')
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Obtenemos todas sus cotizaciones
    const quotes = await Quote.find({ client: dbUser._id })
      .sort({ createdAt: -1 })

    return NextResponse.json(quotes)
  } catch (err) {
    console.error('[GET CLIENT QUOTES]', err)
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 })
  }
}
