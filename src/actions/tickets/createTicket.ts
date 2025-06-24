'use server'

import * as Sentry from '@sentry/nextjs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db'
import Ticket from '@/models/Ticket'
import User from '@/models/User'
import nodemailer from 'nodemailer'

interface TicketPayload {
  subject: string
  description: string
}

export async function createTicket(data: TicketPayload) {
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

    const { subject, description } = data

    if (!subject || !description) {
      return { error: 'Todos los campos son obligatorios.' }
    }

    // Crear ticket con referencia al usuario autenticado
    const newTicket = await Ticket.create({
      client: user._id,
      name: user.name,
      email: user.email,
      subject,
      description,
      status: 'open',
    })

    const ticketId = newTicket._id.toString()
    const ticketSubject = `Nuevo Ticket (#${ticketId}) - ${subject}`

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    // Email al admin
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: 'info@rivasdev.com',
      subject: ticketSubject,
      html: `
        <h2>Nuevo Ticket Recibido</h2>
        <p><strong>Nombre:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Asunto:</strong> ${subject}</p>
        <p><strong>Descripción:</strong><br/>${description}</p>
        <p>ID del ticket: <strong>#${ticketId}</strong></p>
      `,
    })

    // Email de confirmación al cliente
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `Hemos recibido tu ticket (#${ticketId.slice(-8)})`,
      html: `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 30px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); font-family: Arial, sans-serif;">
            <tr>
              <td style="padding: 30px; text-align: center; background-color: #2563eb; color: white;">
                <h2 style="margin: 0;">Rivas Technologies LLC</h2>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px;">
                <p style="font-size: 16px; color: #333;">Hola <strong>${user.name}</strong>,</p>

                <p style="font-size: 16px; color: #333;">
                  Hemos recibido tu solicitud de soporte correctamente. Nuestro equipo está revisando tu caso y te notificaremos por esta vía cuando haya una actualización.
                </p>

                <table cellpadding="0" cellspacing="0" style="width: 100%; margin: 20px 0; font-size: 15px; color: #333;">
                  <tr>
                    <td style="padding: 8px 0;"><strong>Asunto:</strong></td>
                    <td style="padding: 8px 0;">${subject}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; vertical-align: top;"><strong>Descripción:</strong></td>
                    <td style="padding: 8px 0;">${description}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><strong>ID del Ticket:</strong></td>
                    <td style="padding: 8px 0;"><strong>#${ticketId.slice(-8)}</strong></td>
                  </tr>
                </table>

                <p style="font-size: 16px; color: #333;">
                  Para dar seguimiento, añadir información o responder a este ticket, por favor ingresa al <a href="${process.env.SUPPORT_PANEL_URL}" style="color: #2563eb; text-decoration: none;">Panel de Soporte</a>.
                </p>

                <p style="margin-top: 30px; font-size: 16px; color: #333;">
                  Saludos cordiales,<br/>
                  <strong>Equipo de Soporte</strong><br/>
                  Rivas Technologies LLC
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px; text-align: center; background-color: #f0f0f0; font-size: 12px; color: #999;">
                Este correo ha sido generado automáticamente. Por favor, no respondas a este mensaje.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `,
    })

    return {
      message: 'Gracias, tu ticket ha sido enviado con éxito.',
    }
  } catch (error) {
    console.error('[ERROR createTicket]', error)
    Sentry.captureException(error)
    return { error: 'Error al enviar el ticket' }
  }
}
