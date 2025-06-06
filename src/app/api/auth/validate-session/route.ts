import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth/auth'
import { getServerSession } from 'next-auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { ok: false, message: 'Unauthorized or session missing' },
        { status: 401 }
      )
    }

    // Extendemos los campos del usuario manualmente con aserción de tipo
    const user = session.user as {
      id: string
      role: 'admin' | 'client'
      isEmailVerified?: boolean
      isPhoneVerified?: boolean
    }

    const validRoles = ['admin', 'client'] as const
    if (!validRoles.includes(user.role)) {
      return NextResponse.json({ ok: false, message: 'Invalid role' }, { status: 403 })
    }

    return NextResponse.json({
      ok: true,
      role: user.role,
      userId: user.id,
      emailVerified: user.isEmailVerified ?? false,
      phoneVerified: user.isPhoneVerified ?? false,
    })
  } catch (error) {
    console.error('❌ Session validation error:', error)
    return NextResponse.json(
      { ok: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
