// src/lib/auth/auth.ts
import { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import User from '@/models/User'
import connectDB from '@/lib/db'

// Tipado que refleja los campos mínimos que almacenamos en el token/jwt:
interface IUserToken {
  id: string
  name: string
  email: string
  role: 'admin' | 'client'
  isEmailVerified?: boolean
  isPhoneVerified?: boolean
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Conectar a MongoDB
        await connectDB()

        if (!credentials?.email || !credentials.password) return null
        const { email, password } = credentials as { email: string; password: string }

        // Buscar usuario
        const user = await User.findOne({ email }).lean()
        if (!user || !user.password) return null

        // Comparar contraseña
        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) return null

        // Devuelve el shape que luego JWT incluirá en el token
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified ?? false,
          isPhoneVerified: user.isPhoneVerified ?? false,
        } satisfies IUserToken
      },
    }),
  ],

  pages: {
    signIn: '/login', // Ruta personalizada de login (opcional)
  },

  callbacks: {
    /**
     * Este callback se ejecuta cuando se genera/actualiza el JWT.
     * Aquí metemos en el token todos los campos que luego queremos exponer
     * en session.user.
     */
    async jwt({ token, user }) {
      if (user) {
        const u = user as IUserToken
        token.id = u.id
        token.name = u.name
        token.email = u.email
        token.role = u.role
        token.isEmailVerified = u.isEmailVerified ?? false
        token.isPhoneVerified = u.isPhoneVerified ?? false
      }
      return token
    },

    /**
     * Este callback formatea la sesión que el frontend recibirá en useSession().
     * Copiamos los datos del token a session.user.
     */
    async session({ session, token }) {
      if (session.user && token?.email) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.role = token.role as 'admin' | 'client'
        session.user.isEmailVerified = token.isEmailVerified as boolean
        session.user.isPhoneVerified = token.isPhoneVerified as boolean
      }
      return session
    },
  },

  session: {
    strategy: 'jwt',
    // Ajusta maxAge/updateAge según tus necesidades
    maxAge: 10 * 60, 
    updateAge: 5 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
}
