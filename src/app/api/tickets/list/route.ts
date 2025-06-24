import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db'
import Ticket from '@/models/Ticket'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  await connectDB()

  let filter = {}

  if (session.user.role === 'client') {
    console.log('[CLIENT] Email:', session.user.email)
    filter = { email: session.user.email }
  }

  const tickets = await Ticket.find(filter).sort({ updatedAt: -1 }).lean()

  return NextResponse.json({ tickets })
}
