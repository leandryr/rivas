import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db'
import Ticket from '@/models/Ticket'
import User from '@/models/User'
import { sendSupportEmail } from '@/lib/sendSupportEmail'

export async function PATCH(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  await connectDB()

  const user = await User.findOne({ email: session.user.email })
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const ticket = await Ticket.findById(params.id)
  if (!ticket) {
    return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 })
  }

  if (ticket.status === 'closed') {
    return NextResponse.json({ error: 'El ticket ya está cerrado' }, { status: 400 })
  }

  ticket.status = 'closed'
  await ticket.save()

  // ✅ Convertir ObjectId a string antes de usar slice()
  const ticketIdStr = ticket._id.toString()

await sendSupportEmail({
  to: ticket.email,
  subject: `Tu ticket (#${ticketIdStr.slice(-8)}) ha sido cerrado`,
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
                <p style="font-size: 16px; color: #333;">Hola <strong>${ticket.name}</strong>,</p>

                <p style="font-size: 16px; color: #333;">
                  Tu ticket con número <strong>#${ticketIdStr.slice(-8)}</strong> ha sido marcado como <strong>resuelto</strong> y se encuentra cerrado.
                </p>

                <p style="font-size: 16px; color: #333;">
                  <strong>Asunto:</strong> ${ticket.subject}
                </p>

                <p style="font-size: 16px; color: #333;">
                  Si necesitas más asistencia o deseas reabrir el caso, por favor accede a tu panel de soporte desde el siguiente enlace:
                </p>

                <div style="margin: 20px 0; text-align: center;">
                  <a href="https://rivasdev.com/client/tickets/${ticket._id}" 
                     style="background-color: #2563eb; color: white; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-size: 16px;">
                    Ver mi ticket
                  </a>
                </div>

                <p style="margin-top: 30px; font-size: 16px; color: #333;">
                  Saludos cordiales,<br/>
                  <strong>Equipo de Soporte</strong><br/>
                  Rivas Technologies LLC
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px; text-align: center; background-color: #f0f0f0; font-size: 12px; color: #999;">
                Este mensaje fue enviado automáticamente desde nuestro sistema. Por favor, <strong>no respondas directamente a este correo</strong>.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `,
})

  return NextResponse.json({ message: 'Ticket cerrado correctamente.' })
}
