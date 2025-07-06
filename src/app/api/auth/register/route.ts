import connectDB from '@/lib/db'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

/**
 * POST /api/auth/register
 * Registra un usuario y envía un email de bienvenida.
 */
export async function POST(req: Request) {
  try {
    // 1. Parsear y validar cuerpo
    const { name, lastname, company, email, password } = await req.json()
    if (
      !name || !email || !password ||
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      password.length < 6
    ) {
      return NextResponse.json(
        { error: 'Missing fields or password too short (min. 6 characters)' },
        { status: 400 }
      )
    }

    const cleanName     = name.trim()
    const cleanLastname = typeof lastname === 'string' ? lastname.trim() : ''
    const cleanCompany  = typeof company  === 'string' ? company.trim()  : ''
    const cleanEmail    = email.trim().toLowerCase()

    // 2. Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // 3. Conectar DB y verificar duplicado
    await connectDB()
    if (await User.exists({ email: cleanEmail })) {
      return NextResponse.json({ error: 'Email is already registered' }, { status: 400 })
    }

    // 4. Crear usuario con contraseña hasheada
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await User.create({
      name: cleanName,
      lastname: cleanLastname,
      company: cleanCompany,
      email: cleanEmail,
      password: hashedPassword,
      role: 'client',
      provider: 'credentials',
      isEmailVerified: false,
      isPhoneVerified: false,
      hasValidPaymentMethod: false,
      notifications: { email: true, sms: false },
      theme: 'light',
    })

    // 5. Configurar transporter SMTP (inline)
    const transporter = nodemailer.createTransport({
      host:       process.env.EMAIL_HOST,
      port:       Number(process.env.EMAIL_PORT || '587'),
      secure:     process.env.EMAIL_SECURE === 'true',        // true para SSL (465)
      requireTLS: process.env.EMAIL_REQUIRE_TLS === 'true',   // fuerza STARTTLS en 587
      auth: {
        user: process.env.EMAIL_USER!,
        pass: process.env.EMAIL_PASS!,
      },
    })

    // Verificar conexión SMTP antes de enviar
    await transporter.verify()

    // 6. Preparar contenido del email
    const htmlEmail = `
      <div style="font-family:Arial,sans-serif;background:#f3f4f6;padding:40px;">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
          <div style="padding:30px;">
            <h2 style="color:#2563eb;">Hi, ${cleanName}!</h2>
            <p style="font-size:16px;color:#333;line-height:1.6;">
              Welcome to <strong>RivasDev</strong>. Your account has been successfully created.
            </p>
            <p style="font-size:16px;color:#333;line-height:1.6;">
              From your Dashboard, you can chat with our team, track your project, and receive updates.
            </p>
            <div style="text-align:center;margin-top:30px;">
              <a href="https://rivasdev.com/login"
                 style="background:#2563eb;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">
                Log In
              </a>
            </div>
          </div>
          <div style="padding:20px;background:#f9fafb;text-align:center;font-size:13px;color:#777;">
            <p>Need help? Contact us at <a href="mailto:info@rivasdev.com" style="color:#2563eb;">info@rivasdev.com</a></p>
            <p style="margin-top:10px;">© ${new Date().getFullYear()} Rivas Technologies LLC</p>
            <p style="color:#bbb;font-size:12px;">This is an automatic message. Please do not reply.</p>
          </div>
        </div>
      </div>
    `
    const textEmail = htmlEmail.replace(/<[^>]+>/g, '')

    // 7. Enviar email de bienvenida
    transporter.sendMail({
      from:    process.env.EMAIL_FROM || `"RivasDev" <info@rivasdev.com>`,
      to:      cleanEmail,
      subject: 'Welcome to RivasDev – Your account is ready',
      text:    textEmail,
      html:    htmlEmail,
    }).catch(err => {
      console.error('[Welcome Email Error]', err)
    })

    // 8. Responder sin exponer contraseña
    const { _id, createdAt, updatedAt, role, provider } = newUser
    return NextResponse.json({
      message: 'User successfully registered',
      user: { id: _id, name: cleanName, lastname: cleanLastname, company: cleanCompany, email: cleanEmail, role, provider, createdAt, updatedAt }
    })
  } catch (err) {
    console.error('[Registration Error]', err)
    return NextResponse.json(
      { error: 'Internal server error, please try again later.' },
      { status: 500 }
    )
  }
}
