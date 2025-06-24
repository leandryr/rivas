import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db'
import Meeting from '@/models/Meeting'
import User from '@/models/User'
import { NextResponse } from 'next/server'

export async function GET() {
  await connectDB()

  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const user = await User.findOne({ email: session.user.email }).select('_id')
  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
  }

  const meetings = await Meeting.find({
    client: user._id,
    status: 'confirmed',
  }).select('date').lean()

  return NextResponse.json({ meetings })
}
