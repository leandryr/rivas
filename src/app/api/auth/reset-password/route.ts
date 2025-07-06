// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/db'
import User from '@/models/User'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  try {
    // 1. Parsear y validar body
    const { email, token, newPassword } = await req.json()
    if (
      !email ||
      !token ||
      !newPassword ||
      typeof email !== 'string' ||
      typeof token !== 'string' ||
      typeof newPassword !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Missing fields or invalid data' },
        { status: 400 }
      )
    }
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // 2. Conectar a la base de datos
    await connectDB()

    // 3. Hashear token recibido y buscar usuario
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      )
    }

    // 4. Hashear y guardar nueva contraseña
    user.password = await bcrypt.hash(newPassword, 10)

    // 5. Limpiar token y expiración
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined

    await user.save()

    // 6. (Opcional) enviar correo de confirmación
    try {
      const transporter = nodemailer.createTransport({
        host:       process.env.EMAIL_HOST,
        port:       Number(process.env.EMAIL_PORT || '587'),
        secure:     process.env.EMAIL_SECURE === 'true',
        requireTLS: process.env.EMAIL_REQUIRE_TLS === 'true',
        auth: {
          user: process.env.EMAIL_USER!,
          pass: process.env.EMAIL_PASS!,
        },
      })
      await transporter.verify()
      await transporter.sendMail({
        from:    process.env.EMAIL_FROM,
        to:      email,
        subject: 'Your password has been reset – RivasDev',
        text:    'Your password was reset successfully. If you did not perform this action, please contact support.',
        html: `
          <div style="font-family:Arial,sans-serif;padding:30px;background:#f3f4f6;">
            <h2 style="color:#2563eb;">Password Reset Successful</h2>
            <p>Your password on <strong>RivasDev</strong> has been updated successfully.</p>
            <p>If you did not request this change, please <a href="mailto:info@rivasdev.com">contact support</a> immediately.</p>
          </div>
        `,
      })
    } catch (emailErr) {
      console.error('[Reset Confirmation Email Error]', emailErr)
      // no bloquea la respuesta al usuario
    }

    // 7. Responder al cliente
    return NextResponse.json(
      { success: true, message: 'Password has been updated successfully.' },
      { status: 200 }
    )
  } catch (err) {
    console.error('[POST /api/auth/reset-password]', err)
    return NextResponse.json(
      { error: 'Server error, please try again later.' },
      { status: 500 }
    )
  }
}
