'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import styles from './ProfileMenu.module.css'
import Image from 'next/image'

export default function ProfileMenu() {
  const { data: session } = useSession()
  const [showMenu, setShowMenu] = useState(false)
  const [googleConnected, setGoogleConnected] = useState<boolean | null>(null)

  const toggleMenu = () => setShowMenu(prev => !prev)
  const isAdmin = session?.user?.role === 'admin'

  useEffect(() => {
    if (isAdmin) {
      fetch('/api/admin/profile')
        .then(res => res.json())
        .then(data => setGoogleConnected(data.googleConnected))
        .catch(() => setGoogleConnected(null))
    }
  }, [isAdmin])

  return (
    <div className={styles.profile}>
      <div className={styles.avatarWrapper} onClick={toggleMenu}>
        <Image
          src="/user.ico"
          alt="Usuario"
          width={32}
          height={32}
          className={styles.avatar}
        />
      </div>

      {showMenu && (
        <div className={styles.menu}>
          <p className={styles.email}>{session?.user?.email}</p>
          <hr />
          {isAdmin ? (
            <>
              <a href="/admin/profile">Perfil</a>
              <span className={styles.googleStatus}>
                Google Calendar:{' '}
                {googleConnected === null
                  ? '...'
                  : googleConnected
                  ? '✅ Conectado'
                  : '❌ No conectado'}
              </span>
            </>
          ) : (
            <a href="/client/profile">Perfil</a>
          )}
          <hr />
          <button onClick={() => signOut({ callbackUrl: '/login' })}>
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}
