'use client'

import styles from './Modal.module.css'

interface ModalProps {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function Modal({ title, message, onConfirm, onCancel }: ModalProps) {
  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button onClick={onCancel} className={styles.cancel}>
            Cancelar
          </button>
          <button onClick={onConfirm} className={styles.confirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
