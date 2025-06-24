import { NextResponse } from 'next/server';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  await connectDB();

  const user = await User.findOne({ email });

  if (!user || user.provider !== 'credentials') {
    return NextResponse.json({ error: 'User not found or invalid provider' }, { status: 404 });
  }

  // 1. Generar token y expiración
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

  // 2. Guardar en el usuario
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = expires;
  await user.save();

  // 3. Generar HTML con estilo
  const resetUrl = `http://localhost:3000/reset-password?token=${rawToken}&email=${email}`;
  const htmlEmail = `
    <div style="font-family:Arial, sans-serif; background:#f3f4f6; padding:40px;">
      <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
        <div style="padding:30px;">
          <h2 style="color:#2563eb;">Password Reset Request</h2>
          <p style="font-size:16px; line-height:1.6; color:#333;">
            Hi, we received a request to reset your password on <strong>RivasDev</strong>.
          </p>
          <p style="font-size:16px; line-height:1.6; color:#333;">
            Click the button below to reset it. This link expires in 1 hour.
          </p>
          <div style="text-align:center; margin-top:30px;">
            <a href="${resetUrl}" style="background:#2563eb; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block;">
              Reset Password
            </a>
          </div>
          <p style="font-size:14px; color:#555; margin-top:30px;">
            If you didn’t request this, you can ignore this email.
          </p>
        </div>
        <div style="padding:20px; background:#f9fafb; text-align:center; font-size:13px; color:#777;">
          <p>Need help? Contact us at <a href="mailto:info@rivasdev.com" style="color:#2563eb;">info@rivasdev.com</a></p>
          <p style="margin-top:10px;">© ${new Date().getFullYear()} Rivas Technologies LLC</p>
          <p style="color:#bbb; font-size:12px;">This is an automatic message. Please do not reply.</p>
        </div>
      </div>
    </div>
  `;

  // 4. Transporter nodemailer
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.NODE_ENV === 'production',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 5. Enviar correo
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Reset your password – RivasDev',
      html: htmlEmail,
    });
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
