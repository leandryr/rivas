// src/pages/api/auth/[...nextauth].ts
import NextAuth, { NextAuthOptions, Session, User } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import connectDB from '@/lib/db'
import UserModel from '@/models/User'
import type { IUser } from '@/models/User'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'

function getTransporter() {
  const isDev = process.env.NODE_ENV !== 'production'

  return nodemailer.createTransport(
    isDev
      ? {
          host: 'localhost',
          port: 1025,
          secure: false,
          tls: {
            rejectUnauthorized: false,
          },
        }
      : {
          host: process.env.EMAIL_HOST,
          port: Number(process.env.EMAIL_PORT),
          secure: process.env.NODE_ENV === 'production',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        }
  )
}

async function sendWelcomeEmail(to: string, name: string) {
  const transporter = getTransporter()
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
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
              From your client dashboard, you can contact our team, track your project progress, and receive exclusive updates and promotions.
            </p>
            <div style="text-align:center; margin-top:30px;">
              <a href="https://rivasdev.com/login" style="background:#2563eb; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block;">
                Log in
              </a>
            </div>
          </div>
          <div style="padding:20px; background:#f9fafb; text-align:center; font-size:13px; color:#777;">
            <p>Need help? Contact us at <a href="mailto:info@rivasdev.com" style="color:#2563eb;">info@rivasdev.com</a></p>
            <p style="margin-top:10px;">© ${new Date().getFullYear()} Rivas Technologies LLC</p>
            <p style="color:#bbb; font-size:12px;">This is an automated message. Please do not reply.</p>
          </div>
        </div>
      </div>
    `,
  })
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) throw new Error('No credentials provided')

        const { email, password } = credentials

        if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
          throw new Error('Invalid credentials')
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Invalid email format')
        if (password.length < 6) throw new Error('Password must be at least 6 characters long')

        await connectDB()

        const user = (await UserModel.findOne({ email }).exec()) as (IUser & { _id: { toString: () => string } }) | null
        if (!user) throw new Error('User not found')
        if (!user.password) throw new Error('This account has no password set')

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) throw new Error('Incorrect password')

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          lastname: user.lastname || '',
          company: user.company || '',
          phone: user.phone || '',
          bio: user.bio || '',
          language: user.language || '',
          avatar: user.avatar || null,
          role: user.role,
          isEmailVerified: user.isEmailVerified ?? false,
          isPhoneVerified: user.isPhoneVerified ?? false,
        }
      },
    }),
  ],

  pages: {
    signIn: '/login',
  },

callbacks: {
  async signIn({ user, account }) {
    if (account?.provider === 'google') {
      try {
        await connectDB()

        const exists = await UserModel.findOne({ email: user.email }).exec()
        if (!exists) {
          if (!user.name || !user.email) {
            console.warn('[SignIn Warning] Google user missing name or email:', user)
            return false
          }

          const [firstName, ...rest] = user.name.split(' ')
          const lastName = rest.join(' ')

          const newUser = await UserModel.create({
            name: firstName,
            lastname: lastName || '',
            email: user.email,
            avatar: user.image,
            provider: 'google',
            role: 'client',
            isEmailVerified: false,
            notifications: { email: true, sms: false },
            theme: 'light',
          })

          await sendWelcomeEmail(newUser.email, newUser.name)
          console.info('[SignIn Info] User created and welcome email sent:', newUser.email)
        }
      } catch (err) {
        console.error('[SignIn Error]', { error: err, user, account })
        return false
      }
    }
    return true
  },

    async jwt({ token, user }) {
      if (user) {
        // Mejor tipado para user
        token.id = (user as { id: string }).id
        token.name = (user as { name: string }).name
        token.email = (user as { email: string }).email
        token.lastname = (user as { lastname?: string }).lastname || ''
        token.company = (user as { company?: string }).company || ''
        token.phone = (user as { phone?: string }).phone || ''
        token.bio = (user as { bio?: string }).bio || ''
        token.language = (user as { language?: string }).language || ''
        token.avatar = (user as { avatar?: string | null }).avatar || null
        token.role =
          ['admin', 'client'].includes((user as { role: string }).role)
            ? (user as { role: 'client' | 'admin' }).role
            : 'client'
        token.isEmailVerified = (user as { isEmailVerified?: boolean }).isEmailVerified ?? false
        token.isPhoneVerified = (user as { isPhoneVerified?: boolean }).isPhoneVerified ?? false
      }
      return token
    },

    async session({ session, token }) {
      const validRoles = ['client', 'admin'] as const
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        // Aquí agregamos las propiedades extras
        ;(session.user as any).lastname = token.lastname
        ;(session.user as any).company = token.company
        ;(session.user as any).phone = token.phone
        ;(session.user as any).bio = token.bio
        ;(session.user as any).language = token.language
        ;(session.user as any).avatar = token.avatar
        if (validRoles.includes(token.role as any)) {
          session.user.role = token.role as 'client' | 'admin'
        }
        session.user.isEmailVerified = token.isEmailVerified as boolean
        session.user.isPhoneVerified = token.isPhoneVerified as boolean
      }
      return session
    },
  },

  session: {
    strategy: 'jwt',
    maxAge: 10 * 60, // 10 minutos
    updateAge: 5 * 60, // 5 minutos
  },

  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
