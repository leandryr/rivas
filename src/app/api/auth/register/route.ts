import connectDB from '@/lib/db'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

/**
 * POST /api/auth/register
 * Endpoint para registrar un nuevo usuario cliente.
 * Valida datos, verifica duplicados, crea usuario con contraseña hasheada,
 * y envía un email de bienvenida.
 */
export async function POST(req: Request) {
  try {
    // Parseamos el cuerpo JSON
    const { name, lastname, company, email, password } = await req.json()

    // Validaciones básicas y saneamiento
    if (
      !name ||
      !email ||
      !password ||
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

    const cleanEmail = email.trim().toLowerCase()
    const cleanName = name.trim()
    const cleanLastname = typeof lastname === 'string' ? lastname.trim() : ''
    const cleanCompany = typeof company === 'string' ? company.trim() : ''

    // Conectamos a la base de datos
    await connectDB()

    // Verificamos si el email ya está registrado
    const existingUser = await User.findOne({ email: cleanEmail })
    if (existingUser) {
      return NextResponse.json({ error: 'Email is already registered' }, { status: 400 })
    }

    // Hasheamos la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Creamos el usuario en la BD
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

    // Preparamos el transporte para enviar email
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.NODE_ENV === 'production',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    // Email de bienvenida en HTML
    const htmlEmail = `
      <div style="font-family:Arial, sans-serif; background:#f3f4f6; padding:40px;">
        <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
          <div style="padding:30px;">
            <h2 style="color:#2563eb;">Hi, ${cleanName}!</h2>
            <p style="font-size:16px; line-height:1.6; color:#333;">
              Welcome to <strong>RivasDev</strong>. Your account has been successfully created.
            </p>
            <p style="font-size:16px; line-height:1.6; color:#333;">
              From your Dashboard, you can chat with our team, track your project, and receive updates and offers.
            </p>
            <div style="text-align:center; margin-top:30px;">
              <a href="https://rivasdev.com/login" style="background:#2563eb; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block;">
                Log In
              </a>
            </div>
          </div>
          <div style="padding:20px; background:#f9fafb; text-align:center; font-size:13px; color:#777;">
            <p>Need help? Contact us at <a href="mailto:info@rivasdev.com" style="color:#2563eb;">info@rivasdev.com</a></p>
            <p style="margin-top:10px;">© ${new Date().getFullYear()} Rivas Technologies LLC</p>
            <p style="color:#bbb; font-size:12px;">This is an automatic message. Please do not reply.</p>
          </div>
        </div>
      </div>
    `

    // Enviamos el email de bienvenida
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: cleanEmail,
        subject: 'Welcome to RivasDev – Your account is ready',
        html: htmlEmail,
      })
    } catch (emailErr) {
      console.error('Error sending welcome email:', emailErr)
      // No bloqueamos el registro si falla el email
    }

    // Preparamos la respuesta sin contraseña
    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      lastname: newUser.lastname,
      company: newUser.company,
      email: newUser.email,
      role: newUser.role,
      provider: newUser.provider,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    }

    return NextResponse.json({
      message: 'User successfully registered',
      user: userResponse,
    })
  } catch (err) {
    console.error('Registration error:', err)
    return NextResponse.json(
      { error: 'Internal server error, please try again later.' },
      { status: 500 }
    )
  }
}
