import connectDB from '@/lib/db'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: Request) {
  const { name, lastname, company, email, password } = await req.json()

  // Basic validation
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

  await connectDB()

  const userExist = await User.findOne({ email })
  if (userExist) {
    return NextResponse.json({ error: 'Email is already registered' }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await User.create({
    name,
    lastname,
    company,
    email,
    password: hashedPassword,
    role: 'client',
  })

  // Welcome email
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.NODE_ENV === 'production',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Welcome to RivasDev – Your account is ready',
      html: `
        <div style="font-family:Arial, sans-serif; background:#f3f4f6; padding:40px;">
          <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
            <div style="padding:30px;">
              <h2 style="color:#2563eb;">Hi, ${name}!</h2>
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
      `,
    })
  } catch (err) {
    console.error('❌ Error sending welcome email:', err)
  }

  return NextResponse.json({ message: 'User successfully registered', user })
}
