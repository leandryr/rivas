'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import ThemeToggle from '@/components/ui/ThemeToggle'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const logoSrc = theme === 'dark' ? '/logo1.webp' : '/logo.webp'

  return (
    <header className={`${styles.navbar} ${theme}`}>
      <Link href="/" className={styles.logo}>
        <Image
          src={logoSrc}
          alt="RivasDev Logo"
          width={100}
          height={40}
          priority
        />
      </Link>

      <nav className={styles.links}>
        <a href="#portafolio">Portafolio</a>
        <a href="#contacto">Contacto</a>
        <ThemeToggle />
      </nav>
    </header>
  )
}
