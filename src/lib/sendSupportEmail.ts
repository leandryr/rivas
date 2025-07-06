// lib/sendSupportEmail.ts
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.TICKET_EMAIL_HOST,
  port: Number(process.env.TICKET_EMAIL_PORT) || 465,
  secure: true,                    // TLS en 465
  auth: {
    user: process.env.TICKET_EMAIL_USER,
    pass: process.env.TICKET_EMAIL_PASS,
  },
  tls: {
    // en desarrollo puede ayudar a no romperse con certificados self-signed
    rejectUnauthorized: false,
  },
})

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendSupportEmail({ to, subject, html }: EmailOptions) {
  try {
    await transporter.sendMail({
      from: process.env.TICKET_EMAIL_FROM,
      to,
      subject,
      html,
    })
  } catch (err) {
    console.error('[sendSupportEmail] Error al enviar email:', err)
  }
}
