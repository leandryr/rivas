'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import styles from './AdminSidebar.module.css'

const links = [
  { href: '/admin',           label: 'Dashboard'      },
  { href: '/admin/landing-settings',     label: 'Landing'  },
  { href: '/admin/tickets',    label: 'Tickets'       },
  { href: '/admin/projects',   label: 'Proyectos'     },
  { href: '/admin/services',   label: 'Servicios'     },
  { href: '/admin/tasks',     label: 'Tareas'        },
  { href: '/admin/files',     label: 'Documentos'        },
  { href: '/admin/meetings',   label: 'Reuniones'     },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              styles.link,
              pathname === href && styles.active
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}