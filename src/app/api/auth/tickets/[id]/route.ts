import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db'
import Ticket from '@/models/Ticket'
import TicketMessage from '@/models/TicketMessage'
import { Types } from 'mongoose'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } } // ✅ solución definitiva
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !session.user.id) {
    console.error('[AUTH ERROR] Usuario no autenticado o sin ID')
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  await connectDB()

  const id = params.id
  console.log('[PARAMS LOG] ID recibido:', id)

  if (!id || !Types.ObjectId.isValid(id)) {
    console.error('[VALIDATION ERROR] ID inválido:', id)
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  const ticket = await Ticket.findById(id).lean()
  if (!ticket || typeof ticket !== 'object' || Array.isArray(ticket)) {
    console.warn('[NOT FOUND] Ticket no encontrado o inválido')
    return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 })
  }

  const isAdmin = session.user.role === 'admin'
  const isOwner = ticket.email === session.user.email
  console.log(`[AUTH CHECK] Email: ${session.user.email} | Admin: ${isAdmin} | Dueño: ${isOwner}`)

  if (!isAdmin && !isOwner) {
    console.error('[FORBIDDEN] Usuario no autorizado a ver este ticket')
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const messages = await TicketMessage.find({ ticket: id })
    .sort({ createdAt: 1 })
    .lean()

  console.log(`[SUCCESS] Ticket cargado (${ticket._id}) con ${messages.length} mensaje(s)`)
  return NextResponse.json({ ticket, messages })
}
