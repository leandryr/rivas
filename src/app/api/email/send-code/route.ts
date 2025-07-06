import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db'
import User from '@/models/User'
import nodemailer from 'nodemailer'

export async function POST() {
  try {
    await connectDB()

    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Generar y guardar código
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)
    user.settings = {
      ...user.settings,
      emailVerificationCode: code,
      emailVerificationExpires: expiresAt,
    }
    await user.save()

    // Crear transporter leyendo también el flag de secure
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',       // true si usas 465
      requireTLS: process.env.EMAIL_REQUIRE_TLS === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    // Verificar conexión SMTP antes de enviar
    await transporter.verify()

    // Fallback text
    const textFallback =
      `Tu código de verificación en RivasDev es: ${code}. Expira en 5 minutos.`

    // Enviar correo
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Your verification code – RivasDev',
      text: textFallback,
      html: `
        <div style="font-family:Inter,Arial,sans-serif;background:#f3f4f6;padding:40px;">
          <div style="max-width:600px;margin:0 auto;background:white;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
            <div style="padding:32px;text-align:center">
              <h1 style="color:#111827;font-size:24px;margin-bottom:12px;">Email Verification</h1>
              <p style="color:#374151;font-size:16px;line-height:1.6;margin-bottom:24px;">
                Tu código para verificar tu email en <strong>RivasDev</strong>:
              </p>
              <div style="font-size:28px;font-weight:bold;color:#2563eb;letter-spacing:4px;margin:20px 0;">
                ${code}
              </div>
              <p style="color:#6b7280;font-size:14px;">
                Expira en 5 minutos. Si no lo solicitaste, ignora este mensaje.
              </p>
            </div>
            <div style="padding:20px;background:#f9fafb;text-align:center;font-size:13px;color:#6b7280;">
              <p>© ${new Date().getFullYear()} Rivas Technologies LLC</p>
            </div>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[POST /api/verify]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
