// src/app/(public)/blog/layout.tsx

import { ReactNode } from 'react'
import { getLandingConfig } from '@/lib/getLandingConfig'
import NavbarClient from './NavbarClient'
import Footer from '@/components/Footer' // ✅ Ahora importado desde components
import type { ILandingConfig } from '@/models/LandingConfig.model'

export default async function BlogLayout({ children }: { children: ReactNode }) {
  const config = (await getLandingConfig()) as ILandingConfig

  return (
    <>
      <NavbarClient logoUrl={config.logoUrl} primaryColor={config.primaryColor} />
      <main>{children}</main>
      <Footer config={config} />
    </>
  )
}
