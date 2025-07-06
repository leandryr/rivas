'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getTicketWithMessages } from '@/actions/tickets/getTicketWithMessages'
import { replyToTicket } from '@/actions/tickets/replyToTicket'
import { TicketType, MessageType } from '@/types/ticket'

export default function TicketDetailPage() {
  const params = useParams()
  const rawId = params.id
  const id = Array.isArray(rawId) ? rawId[0] : rawId ?? ''
  const router = useRouter()

  const [ticket, setTicket] = useState<TicketType | null>(null)
  const [messages, setMessages] = useState<MessageType[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Ref para hacer scroll al último mensaje
  const endRef = useRef<HTMLDivElement>(null)

  // Cargo ticket y mensajes
  useEffect(() => {
    ;(async () => {
      if (!id) return
      const res = await getTicketWithMessages(id)
      if ('error' in res) {
        setError(res.error || 'Error loading ticket')
      } else {
        // Normalizo ticket
        setTicket({
          ...res.ticket,
          _id: String(res.ticket._id),
          createdAt: new Date(res.ticket.createdAt).toISOString(),
          updatedAt: new Date(res.ticket.updatedAt).toISOString(),
        })
        // Normalizo mensajes
        setMessages(
          res.messages.map((m: any) => ({
            _id: String(m._id),
            ticketId: String(m.ticket),
            sender: m.sender,
            message: m.message,
            createdAt: new Date(m.createdAt).toISOString(),
          }))
        )
      }
      setLoading(false)
    })()
  }, [id])

  // Cada vez que cambian mensajes, hago scroll abajo
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim() || !ticket?._id) return
    setSending(true)
    const res = await replyToTicket(ticket._id, newMessage.trim())
    if ('error' in res) {
      alert(res.error)
    } else {
      setMessages(prev => [
        ...prev,
        {
          _id: String(Date.now()),      // id temporal
          ticketId: ticket._id,
          sender: 'client',
          message: newMessage.trim(),
          createdAt: new Date().toISOString(),
        },
      ])
      setNewMessage('')
    }
    setSending(false)
  }

  if (loading) return <p className="text-center py-10">Loading…</p>
  if (error)   return <p className="text-center py-10 text-red-600">{error}</p>
  if (!ticket) return <p className="text-center py-10">Ticket not found</p>

  return (
    <div className="container mx-auto px-4 py-6 md:px-8 lg:px-16">
      {/* ← Back */}
      <button
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center text-gray-700 hover:text-gray-900"
      >
        ← Back
      </button>

      {/* Header */}
      <h1 className="text-2xl md:text-3xl font-semibold mb-2">
        Subject: {ticket.subject}
      </h1>
      <p className="text-sm text-gray-600 mb-1">
        <span className="font-medium">Status:</span>{' '}
        <span className={ticket.status === 'closed'
            ? 'text-red-600 font-semibold'
            : 'text-green-600 font-semibold'}>
          {ticket.status === 'closed' ? 'Closed' : 'Open'}
        </span>
      </p>
      <p className="text-sm text-gray-600 mb-6">
        <span className="font-medium">Description:</span> {ticket.description}
      </p>

      <hr className="border-gray-200 mb-6" />

      {/* Messages: altura máxima con scroll interno */}
      <h2 className="text-lg font-medium mb-4">Messages</h2>
      <div className="mb-8 max-h-[60vh] overflow-y-auto space-y-4 p-2 bg-white border border-gray-200 rounded">
        {messages.map(msg => (
          <div
            key={msg._id}
            className={`p-4 rounded-lg border-l-4 ${
              msg.sender === 'admin'
                ? 'bg-blue-50 border-blue-400 ml-auto max-w-[80%]'
                : 'bg-gray-50 border-gray-400 mr-auto max-w-[80%]'
            }`}
          >
            <p className="text-xs text-gray-500 uppercase mb-1">
              {msg.sender === 'admin' ? 'Support' : 'You'}
            </p>
            <p className="text-sm text-gray-800">{msg.message}</p>
            <p className="text-xs text-gray-500 mt-2">
              {new Date(msg.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Reply editor */}
      {ticket.status === 'open' ? (
        <div className="mb-6">
          <textarea
            rows={3}
            className="w-full h-28 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 resize-none"
            placeholder="Type your reply…"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
          />
          <button
            onClick={sendMessage}
            disabled={sending}
            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {sending ? 'Sending…' : 'Send Reply'}
          </button>
        </div>
      ) : (
        <div className="p-4 bg-yellow-100 text-yellow-800 rounded mb-6">
          This ticket is closed. You cannot send further messages.
        </div>
      )}
    </div>
  )
}
