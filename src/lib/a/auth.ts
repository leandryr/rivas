// src/lib/auth.ts
// Función de helper para obtener la sesión de NextAuth en rutas API

import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth'

/**
 * Devuelve la sesión autenticada del usuario o null si no hay ninguna.
 */
export async function auth() {
  const session = await getServerSession(authOptions)
  return session
}
