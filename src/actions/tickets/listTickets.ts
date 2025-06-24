'use server'

import * as Sentry from '@sentry/nextjs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db'
import Ticket from '@/models/Ticket'
import type { ITicket } from '@/models/Ticket'
import { formatTicket } from '@/lib/formatters'

export async function listTickets() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return { error: 'No autenticado' }
    }

    await connectDB()

    let filter = {}

    if (session.user.role === 'client') {
      console.log('[CLIENT] Email:', session.user.email)
      filter = { email: session.user.email }
    }

    const rawTickets = await Ticket.find(filter).sort({ updatedAt: -1 }).lean() as unknown as ITicket[]

    const tickets = rawTickets.map(formatTicket)

    return { tickets }
  } catch (error) {
    console.error('[ERROR listTickets]', error)
    Sentry.captureException(error)
    return { error: 'Error al cargar tickets' }
  }
}
