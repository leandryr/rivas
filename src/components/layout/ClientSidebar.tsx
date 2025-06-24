'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import styles from './ClientSidebar.module.css'

const links = [
  { href: '/client', label: 'Mi Panel' },
  { href: '/client/support', label: 'Mis Tickets' },
  { href: '/client/projects', label: 'Mis Proyectos' },
  { href: '/client/meetings', label: 'Mis Reuniones' },
  { href: '/client/files', label: 'Documentos' },
]

export default function ClientSidebar() {
  const pathname = usePathname()

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={clsx(styles.link, pathname === href && styles.active)}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
