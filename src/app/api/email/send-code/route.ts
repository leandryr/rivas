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
    if (!session?.user?.email)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await User.findOne({ email: session.user.email })
    if (!user)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    user.settings = {
      ...user.settings,
      emailVerificationCode: code,
      emailVerificationExpires: expiresAt,
    }
    await user.save()

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Your verification code – RivasDev',
      html: `
        <div style="font-family:Inter,Arial,sans-serif;background:#f3f4f6;padding:40px;">
          <div style="max-width:600px;margin:0 auto;background:white;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
            <div style="padding:32px;">
              <div style="text-align:center;">
                <h1 style="color:#111827;font-size:24px;margin-bottom:12px;">Email Verification</h1>
                <p style="color:#374151;font-size:16px;line-height:1.6;margin-bottom:24px;">
                  To complete your verification on <strong>RivasDev</strong>, please enter the code below:
                </p>
                <div style="font-size:28px;font-weight:bold;color:#2563eb;letter-spacing:4px;margin:20px 0;">
                  ${code}
                </div>
                <p style="color:#6b7280;font-size:14px;">
                  This code will expire in <strong>5 minutes</strong>. If you did not request this, you can ignore this message.
                </p>
              </div>
            </div>
            <div style="padding:20px;background:#f9fafb;text-align:center;font-size:13px;color:#6b7280;">
              <p>Need help? <a href="mailto:info@rivasdev.com" style="color:#2563eb;text-decoration:underline;">Contact us</a></p>
              <p style="margin-top:8px;">© ${new Date().getFullYear()} Rivas Technologies LLC</p>
              <p style="color:#9ca3af;font-size:12px;margin-top:4px;">This is an automatic message. Please do not reply.</p>
            </div>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Email send error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
