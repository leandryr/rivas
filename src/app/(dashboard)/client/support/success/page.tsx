'use client'

import Link from 'next/link'
import styles from './SuccessPage.module.css'

export default function SuccessPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Gracias por contactarnos</h1>
      <p className={styles.message}>
        Hemos recibido tu incidencia y te responderemos a la brevedad.
      </p>
      <Link href="/client/support" className={styles.button}>
        Ver mis tickets
      </Link>
    </div>
  )
}
