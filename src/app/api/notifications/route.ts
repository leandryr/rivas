// src/app/api/notifications/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db'
import Notification from '@/models/Notification'
import { createHash } from 'crypto'

export const revalidate = 0

// GET → últimas 20 notifs con ETag y Cache-Control
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({}, { status: 401 })
  }

  await connectDB()
  const notifs = await Notification.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean()

  const body = JSON.stringify(notifs)
  // Generar hash MD5 como ETag
  const hash = createHash('md5').update(body).digest('hex')
  const tag = `"${hash}"`

  // Si el cliente ya tiene esta versión, devolvemos 304
  if (req.headers.get('if-none-match') === tag) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        'Cache-Control': 'public, max-age=10, stale-while-revalidate=50',
        ETag: tag,
      },
    })
  }

  // Devolvemos el JSON con cabeceras de cache y ETag
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=10, stale-while-revalidate=50',
      ETag: tag,
    },
  })
}

// PATCH → marcar como leída (sin cambios)
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({}, { status: 401 })
  }
  const { id } = await req.json()
  await connectDB()
  await Notification.updateOne(
    { _id: id, userId: session.user.id },
    { $set: { read: true } }
  )
  return NextResponse.json({ ok: true })
}
