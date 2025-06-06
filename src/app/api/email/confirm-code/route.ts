import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import dbConnect from '@/lib/db'
import User from '@/models/User'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { code } = body
    if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 })

    const user = await User.findOne({ email: session.user.email })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const storedCode = user.settings?.emailVerificationCode
    const expiresAt = user.settings?.emailVerificationExpires
      ? new Date(user.settings.emailVerificationExpires)
      : null

    if (!storedCode || !expiresAt) {
      return NextResponse.json({ error: 'No verification code found' }, { status: 400 })
    }

    if (new Date() > expiresAt) {
      return NextResponse.json({ error: 'Code expired' }, { status: 400 })
    }

    if (code !== storedCode) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 })
    }

    user.isEmailVerified = true
    if (!user.settings) user.settings = {}
    user.settings.emailVerificationCode = null
    user.settings.emailVerificationExpires = null

    await user.save()

    // Email de agradecimiento
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.NODE_ENV === 'production',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    const htmlContent = `
      <div style="font-family: Inter, Arial, sans-serif; background-color: #f3f4f6; padding: 40px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
          <div style="padding: 30px; text-align: center;">
            <h2 style="color: #10b981; font-size: 24px; margin-bottom: 12px;">Email Verified</h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Thank you for confirming your email. Your account on <strong>RivasDev</strong> is now verified and ready to go!
            </p>
            <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-top: 20px;">
              You can now access your dashboard, manage your projects, and stay up to date with everything we offer.
            </p>
            <div style="margin-top: 30px;">
              <a href="https://rivasdev.com/client" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
                Go to Dashboard
              </a>
            </div>
          </div>
          <div style="padding: 20px; background-color: #f9fafb; text-align: center; font-size: 13px; color: #6b7280;">
            <p>Need help? Contact us at <a href="mailto:info@rivasdev.com" style="color: #2563eb;">info@rivasdev.com</a></p>
            <p style="margin-top: 10px;">© ${new Date().getFullYear()} Rivas Technologies LLC</p>
            <p style="color: #9ca3af; font-size: 12px;">This is an automatic message. Please do not reply.</p>
          </div>
        </div>
      </div>
    `

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Email Confirmed – Welcome to RivasDev',
      html: htmlContent,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Confirm code error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
