import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: 'admin' | 'client'
      name?: string | null
      email?: string | null
      image?: string | null
      isEmailVerified?: boolean
      isPhoneVerified?: boolean
    }
  }

  interface User {
    id: string
    role: 'admin' | 'client'
    email?: string | null
    name?: string | null
    image?: string | null
    isEmailVerified?: boolean
    isPhoneVerified?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: 'admin' | 'client'
    isEmailVerified?: boolean
    isPhoneVerified?: boolean
  }
}
