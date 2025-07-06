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
    // 1. Verify session
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return { error: 'Not authenticated' }
    }

    // 2. Connect to DB and load user
    await connectDB()
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return { error: 'User not found' }
    }

    // 3. Validate inputs
    const subject = data.subject?.trim() ?? ''
    const description = data.description?.trim() ?? ''
    if (!subject || !description) {
      return { error: 'Subject and description are required.' }
    }

    // 4. Create the ticket
    const newTicket = await Ticket.create({
      client:      user._id,
      name:        user.name,
      email:       user.email,
      subject,
      description,
      status:      'open',
    })
    const ticketId = newTicket._id.toString()
    const ticketSubject = `New Support Ticket (#${ticketId}) – ${subject}`

    // 5. Configure Zoho SMTP transporter
    const transporter = nodemailer.createTransport({
      host:       process.env.TICKET_EMAIL_HOST!,
      port:       Number(process.env.TICKET_EMAIL_PORT || '587'),
      secure:     process.env.TICKET_EMAIL_SECURE === 'true',      // true for SSL (465)
      requireTLS: process.env.TICKET_EMAIL_REQUIRE_TLS === 'true', // force STARTTLS on 587
      auth: {
        user: process.env.TICKET_EMAIL_USER!,
        pass: process.env.TICKET_EMAIL_PASS!,
      },
      tls: { rejectUnauthorized: false },
    })

    // 6. Early verify (warn, don’t fail)
    try {
      await transporter.verify()
    } catch (verifyErr) {
      console.warn('[Email Warning] SMTP verify failed, proceeding anyway:', verifyErr)
    }

    // 7. Send notification to admin
    try {
      await transporter.sendMail({
        from:    process.env.TICKET_EMAIL_FROM,
        to:      process.env.TICKET_EMAIL_USER,
        subject: ticketSubject,
        html: `
          <h2>New Support Ticket Received</h2>
          <p><strong>Name:</strong> ${user.name}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Description:</strong><br/>${description}</p>
          <p><strong>Ticket ID:</strong> #${ticketId}</p>
        `,
      })
    } catch (adminErr) {
      console.error('[Email Error] Failed to notify admin:', adminErr)
    }

    // 8. Send confirmation to the user (in English)
    try {
      await transporter.sendMail({
        from:    process.env.TICKET_EMAIL_FROM,
        to:      user.email,
        subject: `We’ve received your ticket (#${ticketId.slice(-8)})`,
        html: `
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.05);font-family:Arial,sans-serif;">
                  <tr>
                    <td style="padding:30px;text-align:center;background:#2563eb;color:#ffffff;">
                      <h2 style="margin:0;">Rivas Technologies LLC</h2>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:30px;color:#333;font-size:16px;line-height:1.6;">
                      <p>Hello <strong>${user.name}</strong>,</p>
                      <p>Thank you for contacting our support team. Your ticket has been received and is now being reviewed by our staff.</p>
                      <p><strong>Ticket ID:</strong> #${ticketId.slice(-8)}</p>
                      <p>Subject: ${subject}</p>
                      <p>Description: ${description}</p>
                      <p>We will notify you as soon as there’s an update.</p>
                      <p style="margin-top:20px;">
                        You can check the status of your ticket at any time by visiting your <a href="${process.env.SUPPORT_PANEL_URL}">Support Dashboard</a>.
                      </p>
                      <p style="margin-top:30px;">Best regards,<br/>Support Team</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px;text-align:center;background:#f0f0f0;font-size:12px;color:#999;">
                      This is an automated message. Please do not reply.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        `,
      })
    } catch (userErr) {
      console.error('[Email Error] Failed to send confirmation to user:', userErr)
    }

    // 9. Return success
    return {
      message: 'Your ticket has been submitted successfully.',
      ticketId,
    }

  } catch (error) {
    console.error('[ERROR createTicket]', error)
    Sentry.captureException(error)
    return { error: 'Failed to submit the ticket.' }
  }
}
