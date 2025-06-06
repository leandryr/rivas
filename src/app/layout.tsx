'use client'

import './globals.css'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ReactNode } from 'react'
import { Toaster } from 'react-hot-toast' // opcional si usas toast
import Head from 'next/head'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="description" content="RivasDEV - Conecta freelancers y clientes" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <title>RivasDEV</title>
      </Head>
      <body className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased">
        <SessionProvider>
          <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster position="top-right" /> {/* opcional: para notificaciones rápidas */}
          </NextThemesProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
