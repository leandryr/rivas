'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import styles from './Topbar.module.css'
import Image from 'next/image'

export default function Topbar() {
  const { data: session } = useSession()
  const [showMenu, setShowMenu] = useState(false)
  const toggleMenu = () => setShowMenu(prev => !prev)

  const hasNotification = true // luego conectar con Mongo

  return (
    <header className={styles.topbar}>
      <div className={styles.left}></div>

      <div className={styles.right}>
        <button className={styles.notificationBtn} aria-label="Notificaciones">
          <Image
            src="/noti.ico"
            alt="Notificaciones"
            width={24}
            height={24}
            className={styles.bell}
          />
          {hasNotification && <span className={styles.badge} />}
        </button>

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
            <button disabled>Perfil</button>
            <button disabled>Ajustes</button>
            <button disabled>Pagos</button>
            <button disabled>Crédito</button>
            <hr />
            <button onClick={() => signOut({ callbackUrl: '/login' })}>Cerrar sesión</button>
          </div>
        )}
      </div>
    </header>
  )
}
