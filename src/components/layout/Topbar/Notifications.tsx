'use client'

import styles from './Topbar.module.css'
import Image from 'next/image'

export default function Notifications() {
  const hasNotification = true // luego conectar con Mongo

  return (
    <button className={styles.notificationBtn} aria-label="Notificaciones">
      <Image src="/noti.ico" alt="Notificaciones" width={24} height={24} className={styles.bell} />
      {hasNotification && <span className={styles.badge} />}
    </button>
  )
}
