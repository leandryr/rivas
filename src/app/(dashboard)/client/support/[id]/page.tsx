'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import styles from './TicketDetail.module.css'
import { getTicketWithMessages } from '@/actions/tickets/getTicketWithMessages'
import { replyToTicket } from '@/actions/tickets/replyToTicket'
import { TicketType, MessageType } from 'types/ticket'

export default function TicketDetailPage() {
  const params = useParams()
  const id = typeof params.id === 'string' ? params.id : ''
  const [ticket, setTicket] = useState<TicketType | null>(null)
  const [messages, setMessages] = useState<MessageType[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!id) return
      const result = await getTicketWithMessages(id)

      if ('error' in result) {
        setError(result.error || 'Error al cargar ticket')
      } else {
        setTicket({
          _id: String(result.ticket._id),
          subject: result.ticket.subject,
          description: result.ticket.description,
          status: result.ticket.status,
          name: result.ticket.name,
          email: result.ticket.email,
          createdAt: new Date(result.ticket.createdAt).toISOString(),
          updatedAt: new Date(result.ticket.updatedAt).toISOString()
        })

        const formattedMessages = result.messages.map((msg: any) => ({
          _id: String(msg._id),
          ticketId: String(msg.ticket),
          sender: msg.sender,
          message: msg.message,
          createdAt: new Date(msg.createdAt).toISOString()
        }))

        setMessages(formattedMessages)
      }

      setLoading(false)
    }

    load()
  }, [id])

  const sendMessage = async () => {
    if (!newMessage.trim() || !ticket?._id) return

    setSending(true)
    const result = await replyToTicket(ticket._id, newMessage)

    if ('error' in result) {
      alert(result.error || 'Error al enviar mensaje')
    } else {
      setMessages(prev => [...prev, {
        _id: crypto.randomUUID(),
        ticketId: ticket._id,
        sender: 'client',
        message: newMessage,
        createdAt: new Date().toISOString()
      }])
      setNewMessage('')
    }

    setSending(false)
  }

  if (loading) return <p className={styles.loading}>Cargando...</p>
  if (error) return <p className={styles.error}>{error}</p>
  if (!ticket) return <p className={styles.error}>Ticket no encontrado</p>

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Asunto: {ticket.subject}</h1>
      <p><strong>Estado:</strong> {ticket.status === 'closed' ? 'Cerrado' : 'Abierto'}</p>
      <p><strong>Descripción:</strong> {ticket.description}</p>

      <hr className={styles.divider} />

      <h2 className={styles.subtitle}>Mensajes</h2>
      <div className={styles.messages}>
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.sender === 'admin' ? styles.adminMsg : styles.clientMsg}>
            <p className={styles.sender}>{msg.sender === 'admin' ? 'Soporte' : 'Tú'}</p>
            <p>{msg.message}</p>
            <span className={styles.time}>{new Date(msg.createdAt).toLocaleString()}</span>
          </div>
        ))}
      </div>

      {ticket.status === 'open' ? (
        <div className={styles.replySection}>
          <textarea
            className={styles.textarea}
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Escribe tu respuesta..."
          />
          <button
            onClick={sendMessage}
            disabled={sending}
            className={styles.button}
          >
            {sending ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      ) : (
        <p className={styles.closed}>Este ticket está cerrado. No puedes enviar más mensajes.</p>
      )}
    </div>
  )
}
