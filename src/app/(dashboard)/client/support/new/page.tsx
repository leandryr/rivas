'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './SupportForm.module.css'
import { createTicket } from '@/actions/tickets/createTicket'

export default function SupportForm() {
  const router = useRouter()
  const [form, setForm] = useState({
    subject: '',
    description: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    const result = await createTicket(form)
    setLoading(false)

    if ('error' in result) {
      setError(result.error || 'Error al enviar el ticket')
    } else {
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        router.push('/client/support?success=created')
      }, 2000)
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Formulario de Soporte</h1>

      {error && <p className={styles.error}>{error}</p>}
      {showSuccess && <div className={styles.successModal}>✅ Ticket creado correctamente</div>}

      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          name="subject"
          placeholder="Asunto"
          value={form.subject}
          onChange={handleChange}
          className={styles.input}
          required
        />
        <textarea
          name="description"
          placeholder="Describe tu problema..."
          value={form.description}
          onChange={handleChange}
          className={styles.textarea}
          required
        />
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className={styles.button}
          disabled={loading}
        >
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>

      {showConfirm && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>¿Confirmar envío del ticket?</h2>
            <p className={styles.modalText}>Revisaremos tu solicitud lo antes posible.</p>
            <div className={styles.modalActions}>
              <button className={styles.cancel} onClick={() => setShowConfirm(false)}>Cancelar</button>
              <button className={styles.confirm} onClick={handleSubmit}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
