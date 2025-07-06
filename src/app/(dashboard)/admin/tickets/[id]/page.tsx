'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
  const params = useParams()
  const rawId = params.id
  const id = Array.isArray(rawId) ? rawId[0] : rawId ?? ''
  const router = useRouter()

  const [ticket, setTicket] = useState<TicketType | null>(null)
  const [messages, setMessages] = useState<MessageType[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    ;(async () => {
      if (!id) return
      const result = await getTicketWithMessages(id)
      if ('error' in result) {
        console.error(result.error)
        return
      }
      setTicket(result.ticket)
      setMessages(result.messages)
    })()
  }, [id])

  const sendMessage = async () => {
    if (!newMessage.trim() || !ticket?._id) return
    setLoading(true)
    const result = await replyToTicket(ticket._id, newMessage.trim())
    if ('error' in result) {
      alert(result.error)
    } else {
      setMessages(prev => [...prev, { sender: 'admin', message: newMessage.trim() }])
      setNewMessage('')
      setSuccessMessage('✅ Message sent successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
    setLoading(false)
  }

  const closeTicket = async () => {
    setShowConfirm(false)
    if (!ticket?._id) return
    const result = await closeTicketAction(ticket._id)
    if ('error' in result) {
      alert(result.error || 'Error closing ticket.')
    } else {
      setTicket(prev => prev ? { ...prev, status: 'closed' } : prev)
      setSuccessMessage('✅ Ticket closed successfully')
      setTimeout(() => router.push('/admin/tickets'), 2500)
    }
  }

  if (!ticket) {
    return <p className="text-center py-10 text-gray-600">Loading…</p>
  }

  return (
    <div className="container mx-auto px-4 py-6 md:px-8">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
      >
        ← Back
      </button>

      {/* Success toast */}
      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-800 px-4 py-2 rounded shadow">
          {successMessage}
        </div>
      )}

      {/* Header */}
      <h1 className="text-2xl md:text-3xl font-semibold mb-2">
        Ticket: {ticket.subject}
      </h1>
      <p className="text-sm text-gray-700 mb-1">
        <span className="font-medium">Client:</span> {ticket.name} ({ticket.email})
      </p>
      <p className="text-sm text-gray-700 mb-4">
        <span className="font-medium">Description:</span> {ticket.description}
      </p>

      <hr className="border-gray-200 my-6" />

      {/* Messages */}
      <h2 className="text-lg font-medium mb-4">Messages</h2>
      <div className="space-y-4 mb-6">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-lg border-l-4 ${
              msg.sender === 'admin'
                ? 'bg-blue-50 border-blue-500'
                : 'bg-gray-50 border-gray-400'
            }`}
          >
            <p className="text-xs text-gray-500 uppercase mb-1">
              {msg.sender === 'admin' ? 'Admin' : 'Client'}
            </p>
            <p className="text-sm text-gray-800">{msg.message}</p>
          </div>
        ))}
      </div>

      {/* Reply form */}
      {ticket.status !== 'closed' ? (
        <>
          <textarea
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Write your reply…"
            className="w-full h-28 p-3 border border-gray-300 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Sending…' : 'Send Reply'}
          </button>
        </>
      ) : (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded mb-4">
          This ticket is closed. No further messages can be sent.
        </div>
      )}

      {/* Close button */}
      <button
        onClick={() => setShowConfirm(true)}
        disabled={ticket.status === 'closed'}
        className={`mt-6 px-4 py-2 rounded text-white transition ${
          ticket.status === 'closed'
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-red-600 hover:bg-red-700'
        }`}
      >
        {ticket.status === 'closed' ? 'Ticket Closed' : 'Close Ticket'}
      </button>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-11/12 max-w-md">
            <h3 className="text-lg font-semibold mb-2">Close this ticket?</h3>
            <p className="text-sm text-gray-600 mb-4">
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={closeTicket}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
