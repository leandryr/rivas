import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Quote } from '@/models/Quote'
import User from '@/models/User'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth'
import { Types } from 'mongoose'

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB()

  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dbUser = await User.findOne({ email: session.user.email }).select('_id')
  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const { id } = await context.params
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid quote ID' }, { status: 400 })
  }

  try {
    const quote = await Quote.findOne({ _id: id, client: dbUser._id })
    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }
    if (quote.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending quotes can be rejected' },
        { status: 400 }
      )
    }

    quote.status = 'rejected'
    await quote.save()
    return NextResponse.json(quote)
  } catch (err) {
    console.error('[REJECT QUOTE]', err)
    return NextResponse.json({ error: 'Failed to reject quote' }, { status: 500 })
  }
}
