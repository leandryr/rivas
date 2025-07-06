// src/app/layout.tsx (sin use client)
import './globals.css'
import { ReactNode } from 'react'
import ClientProviders from './ClientProviders'

export const metadata = {
  title: 'Rivas Technologies LLC | Desarrollo Web y Software Personalizado',
  description:
    'Rivas Technologies LLC diseña, desarrolla e implementa soluciones de software a medida, plataformas SaaS, integración de hardware y consultoría profesional para clientes en Estados Unidos e internacionalmente.',
  keywords: [
    'Rivas Technologies LLC',
    'rivasdev',
    'desarrollo web',
    'software a medida',
    'SaaS',
    'consultoría tecnológica',
    'Next.js',
    'aplicaciones modernas',
    'soluciones personalizadas',
    'Georgia'
  ],
  openGraph: {
    title: 'Rivas Technologies LLC | Desarrollo Web y Software Personalizado',
    description:
      'Rivas Technologies LLC diseña, desarrolla e implementa soluciones de software a medida, plataformas SaaS, integración de hardware y consultoría profesional para clientes en Estados Unidos e internacionalmente.',
    url: 'https://www.rivasdev.com',
    siteName: 'Rivas Technologies LLC',
    images: [
      {
        url: 'https://www.rivasdev.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Rivas Technologies LLC - Desarrollo Web y Software Personalizado',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rivas Technologies LLC | Desarrollo Web y Software Personalizado',
    description:
      'Rivas Technologies LLC diseña, desarrolla e implementa soluciones de software a medida, plataformas SaaS, integración de hardware y consultoría profesional para clientes en Estados Unidos e internacionalmente.',
    images: ['https://www.rivasdev.com/og-image.png'],
  },
  metadataBase: new URL('https://www.rivasdev.com'),
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
