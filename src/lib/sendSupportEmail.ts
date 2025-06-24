import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.TICKET_EMAIL_USER,
    pass: process.env.TICKET_EMAIL_PASS,
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
  } catch (error) {
    console.error('[sendSupportEmail] Error al enviar email:', error)
  }
}
