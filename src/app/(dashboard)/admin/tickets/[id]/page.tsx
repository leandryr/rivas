'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import styles from './TicketDetail.module.css'
import { getTicketWithMessages } from '@/actions/tickets/getTicketWithMessages'
import { replyToTicket } from '@/actions/tickets/replyToTicket'
import { closeTicket as closeTicketAction } from '@/actions/tickets/closeTicket'

type TicketType = {
  _id: string
  subject: string
  description: string
  name: string
  email: string
  status: 'open' | 'closed'
}

type MessageType = {
  sender: 'admin' | 'client'
  message: string
}

export default function TicketDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [ticket, setTicket] = useState<TicketType | null>(null)
  const [messages, setMessages] = useState<MessageType[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!id || typeof id !== 'string') return
      const result = await getTicketWithMessages(id)
      if ('error' in result) return
      setTicket(result.ticket)
      setMessages(result.messages)
    }
    load()
  }, [id])

  const sendMessage = async () => {
    if (!newMessage.trim() || !ticket?._id) return
    setLoading(true)

    const result = await replyToTicket(ticket._id, newMessage)
    if ('error' in result) {
      alert(result.error)
    } else {
      setMessages(prev => [...prev, { sender: 'admin', message: newMessage }])
      setNewMessage('')
      setSuccessMessage('✅ Mensaje enviado correctamente')
      setTimeout(() => setSuccessMessage(''), 3000)
    }

    setLoading(false)
  }

  const closeTicket = async () => {
    setShowConfirm(false)
    if (!ticket?._id) return
    const result = await closeTicketAction(ticket._id)

    if ('error' in result) {
      alert(result.error || 'Error al cerrar el ticket.')
    } else {
      setTicket(prev => ({ ...(prev as TicketType), status: 'closed' }))
      setSuccessMessage('✅ Ticket cerrado correctamente')
      setTimeout(() => router.push('/admin/tickets'), 2500)
    }
  }

  if (!ticket) return <p>Cargando...</p>

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Ticket: {ticket.subject}</h1>
      <p><strong>Cliente:</strong> {ticket.name} ({ticket.email})</p>
      <p><strong>Descripción:</strong> {ticket.description}</p>

      <hr className={styles.divider} />

      <h2 className={styles.subtitle}>Mensajes</h2>
      <div className={styles.messages}>
        {messages.map((msg, idx) => (
          <div key={idx} className={styles.messageBox}>
            <p className={styles.messageSender}>{msg.sender === 'admin' ? 'Admin' : 'Cliente'}</p>
            <p>{msg.message}</p>
          </div>
        ))}
      </div>

      {ticket.status !== 'closed' && (
        <>
          <textarea
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            className={styles.textarea}
            placeholder="Escribe una respuesta..."
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className={styles.sendButton}
          >
            {loading ? 'Enviando...' : 'Enviar Respuesta'}
          </button>
        </>
      )}

      {ticket.status === 'closed' && (
        <p className={styles.closedAlert}>
          Este ticket está cerrado y no se pueden enviar mensajes.
        </p>
      )}

      <button
        onClick={() => setShowConfirm(true)}
        disabled={ticket.status === 'closed'}
        className={styles.closeButton}
      >
        {ticket.status === 'closed' ? 'Ticket Cerrado' : 'Cerrar Ticket'}
      </button>

      {showConfirm && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>¿Cerrar este ticket?</h2>
            <p className={styles.modalText}>Esta acción no se puede deshacer.</p>
            <div className={styles.modalActions}>
              <button onClick={() => setShowConfirm(false)} className={styles.cancel}>
                Cancelar
              </button>
              <button onClick={closeTicket} className={styles.confirm}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className={styles.successModal}>{successMessage}</div>
      )}
    </div>
  )
}
