'use server'

import * as Sentry from '@sentry/nextjs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db'
import Ticket from '@/models/Ticket'
import TicketMessage from '@/models/TicketMessage'
import { Types } from 'mongoose'
import { formatTicket, formatMessage } from '@/lib/formatters'
import type { ITicket } from '@/models/Ticket'
import type { ITicketMessage } from '@/models/TicketMessage'

export async function getTicketWithMessages(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !session.user.id) {
      console.error('[AUTH ERROR] Usuario no autenticado o sin ID')
      return { error: 'No autenticado' }
    }

    await connectDB()

    console.log('[PARAMS LOG] ID recibido:', id)

    if (!id || !Types.ObjectId.isValid(id)) {
      console.error('[VALIDATION ERROR] ID inválido:', id)
      return { error: 'ID inválido' }
    }

    const ticket = await Ticket.findById(id).lean() as unknown as ITicket
    if (!ticket || typeof ticket !== 'object' || Array.isArray(ticket)) {
      console.warn('[NOT FOUND] Ticket no encontrado o inválido')
      return { error: 'Ticket no encontrado' }
    }

    const isAdmin = session.user.role === 'admin'
    const isOwner = ticket.email === session.user.email
    console.log(`[AUTH CHECK] Email: ${session.user.email} | Admin: ${isAdmin} | Dueño: ${isOwner}`)

    if (!isAdmin && !isOwner) {
      console.error('[FORBIDDEN] Usuario no autorizado a ver este ticket')
      return { error: 'No autorizado' }
    }

    const messages = await TicketMessage.find({ ticket: id })
      .sort({ createdAt: 1 })
      .lean() as unknown as ITicketMessage[]

    console.log(`[SUCCESS] Ticket cargado (${ticket._id}) con ${messages.length} mensaje(s)`)
    return {
      ticket: formatTicket(ticket),
      messages: messages.map(formatMessage),
    }
  } catch (error) {
    console.error('[ERROR getTicketWithMessages]', error)
    Sentry.captureException(error)
    return { error: 'Error al cargar el ticket' }
  }
}
