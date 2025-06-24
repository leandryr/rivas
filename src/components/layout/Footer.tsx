'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import styles from './Footer.module.css'

export default function Footer() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <footer className={`${styles.footer} ${theme === 'dark' ? styles.dark : styles.light}`}>
      <p>© {new Date().getFullYear()} Rivas Technologies LLC</p>
      <p className={styles.sub}>rivasdev.com</p>
    </footer>
  )
}
