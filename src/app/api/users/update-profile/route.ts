import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import UserModel from '@/models/User'
import { authOptions } from '@/lib/auth/auth'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { lastname, bio, language } = await req.json()

    // Validaciones básicas
    if (
      typeof lastname !== 'string' || lastname.trim() === '' ||
      typeof bio !== 'string' || bio.trim() === '' ||
      typeof language !== 'string' || !['es', 'en'].includes(language)
    ) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    await connectDB()

    const updated = await UserModel.updateOne(
      { email: session.user.email },
      { $set: { lastname: lastname.trim(), bio: bio.trim(), language } }
    )

    if (updated.modifiedCount === 0) {
      return NextResponse.json({ error: 'User not found or no changes made' }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('❌ Error updating user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
