'use client'

import styles from './Topbar.module.css'
import Notifications from './Notifications'
import ProfileMenu from './ProfileMenu'

export default function Topbar() {
  return (
    <header className={styles.topbar}>
      <div className={styles.left}></div>
      <div className={styles.right}>
        <Notifications />
        <ProfileMenu />
      </div>
    </header>
  )
}
