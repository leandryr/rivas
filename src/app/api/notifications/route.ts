// src/app/api/notifications/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db'
import Notification from '@/models/Notification'

// GET → últimas 20 notifs
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({}, { status: 401 })
  }
  await connectDB()
  const notifs = await Notification.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean()
  return NextResponse.json(notifs)
}

// PATCH → marcar como leída
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
