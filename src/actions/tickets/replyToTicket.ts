'use server'

import * as Sentry from '@sentry/nextjs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db'
import Ticket from '@/models/Ticket'
import TicketMessage from '@/models/TicketMessage'
import User from '@/models/User'
import { sendSupportEmail } from '@/lib/sendSupportEmail'

export async function replyToTicket(id: string, message: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return { error: 'No autenticado' }
    }

    await connectDB()

    const user = await User.findOne({ email: session.user.email })

    if (!user) {
      return { error: 'Usuario no encontrado' }
    }

    if (!message || message.trim() === '') {
      return { error: 'Mensaje vacío' }
    }

    const ticket = await Ticket.findById(id)
    if (!ticket) {
      return { error: 'Ticket no encontrado' }
    }

    const isAdmin = user.role === 'admin'
    const isOwner = ticket.email === user.email

    if (!isAdmin && !isOwner) {
      return { error: 'No autorizado' }
    }

    if (ticket.status === 'closed') {
      return { error: 'El ticket está cerrado' }
    }

    await TicketMessage.create({
      ticket: ticket._id,
      sender: isAdmin ? 'admin' : 'client',
      message,
    })

    // ✅ Corrección: convertir ObjectId a string antes de usar .slice()
    const ticketIdStr = ticket._id.toString()

    await sendSupportEmail({
      to: ticket.email,
      subject: `Tu ticket ha sido respondido (#${ticketIdStr.slice(-8)})`,
      html: `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 30px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); font-family: Arial, sans-serif; overflow: hidden;">
            <tr>
              <td style="padding: 30px; text-align: center; background-color: #2563eb; color: white;">
                <h1 style="margin: 0; font-size: 24px;">Rivas Technologies LLC</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px;">
                <p style="font-size: 16px; color: #333;">Hola <strong>${ticket.name}</strong>,</p>

                <p style="font-size: 16px; color: #333;">
                  Hemos respondido a tu solicitud de soporte con número de ticket 
                  <strong>#${ticketIdStr.slice(-8)}</strong>.
                </p>

                <p style="font-size: 16px; color: #333;">
                  Para continuar con este ticket, por favor <strong>no respondas a este correo</strong>. 
                  Ingresa directamente a tu panel de soporte para leer y responder:
                </p>

                <div style="margin: 20px 0; text-align: center;">
                  <a href="https://rivasdev.com/client/tickets/${ticket._id}" 
                     style="background-color: #2563eb; color: white; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-size: 16px;">
                    Ver Ticket en el Panel
                  </a>
                </div>

                <p style="font-size: 16px; color: #333; margin-top: 30px;">
                  Saludos cordiales,<br/>
                  <strong>Equipo de Soporte</strong><br/>
                  Rivas Technologies LLC
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px; text-align: center; background-color: #f0f0f0; font-size: 12px; color: #999;">
                Este es un mensaje automático. No respondas directamente a este correo. Para interactuar, usa el panel de soporte.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `,
    })

    return { message: 'Respuesta enviada' }
  } catch (error) {
    console.error('[ERROR replyToTicket]', error)
    Sentry.captureException(error)
    return { error: 'Error al responder el ticket' }
  }
}
