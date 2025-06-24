import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const protectedRoutes: Record<string, 'admin' | 'client'> = {
  '/admin': 'admin',
  '/client': 'client',
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ✅ Excluir /client/onboarding
  if (pathname.startsWith('/client/onboarding')) {
    return NextResponse.next()
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (pathname.startsWith('/dashboard/admin')) {
    if (!token || token.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    return NextResponse.next()
  }

  if (
    !token &&
    Object.keys(protectedRoutes).some((path) => pathname.startsWith(path))
  ) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (token) {
    for (const path in protectedRoutes) {
      if (pathname.startsWith(path)) {
        const requiredRole = protectedRoutes[path]
        if (token.role !== requiredRole) {
          return NextResponse.redirect(new URL(`/${token.role}`, req.url))
        }
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/admin/:path*',
    '/dashboard/client/:path*',
    '/admin/:path*',
    '/client/:path*',
  ],
}
