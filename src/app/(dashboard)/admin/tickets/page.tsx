'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { listTickets } from '@/actions/tickets/listTickets'

interface Ticket {
  _id: string
  name: string
  email: string
  subject: string
  status?: string
  createdAt: string
  updatedAt: string
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const [showSuccess, setShowSuccess] = useState(!!success)

  useEffect(() => {
    ;(async () => {
      const data = await listTickets()
      if (!('error' in data)) setTickets(data.tickets ?? [])
      setLoading(false)
    })()
  }, [])

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [showSuccess])

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const filtered = tickets.filter(t =>
    `${t.name} ${t.email} ${t.subject}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const pageCount = Math.ceil(filtered.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const paginated = filtered.slice(startIdx, startIdx + itemsPerPage)

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl md:text-3xl font-semibold mb-6">
        Support Tickets
      </h1>

      {showSuccess && (
        <div
          className="mb-6 px-4 py-2 rounded bg-green-100 text-green-800 text-sm md:text-base"
          role="alert"
        >
          {success === 'closed'
            ? '✅ Ticket closed successfully'
            : '✅ Action completed successfully'}
        </div>
      )}

      <input
        type="text"
        placeholder="Search by name, email or subject…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full md:w-1/2 mb-6 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />

      {loading ? (
        <p className="text-center text-gray-600">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-600">
          No tickets match your search.
        </p>
      ) : (
        <>
          {/* Desktop: table */}
          <div className="hidden md:block overflow-x-auto mb-4">
            <table className="min-w-full bg-white divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['ID','Name','Email','Subject','Status','Updated At','Actions'].map(h => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map(ticket => (
                  <tr key={ticket._id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm text-gray-800">
                      {ticket._id.slice(-6)}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-800">
                      {ticket.name}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-800">
                      {ticket.email}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-800">
                      {ticket.subject}
                    </td>
                    <td
                      className={`px-3 py-2 text-sm font-medium ${
                        ticket.status === 'closed'
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      {ticket.status === 'closed' ? 'Closed' : 'Open'}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-600">
                      {new Date(ticket.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Link
                        href={`/admin/tickets/${ticket._id}`}
                        className="inline-block px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: grid cards */}
          <div className="md:hidden grid grid-cols-1 gap-4 mb-4">
            {paginated.map(ticket => (
              <div
                key={ticket._id}
                className="border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-800">
                    #{ticket._id.slice(-6)}
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      ticket.status === 'closed'
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}
                  >
                    {ticket.status === 'closed' ? 'Closed' : 'Open'}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-medium">Name:</span> {ticket.name}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-medium">Email:</span> {ticket.email}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-medium">Subject:</span> {ticket.subject}
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  Updated: {new Date(ticket.updatedAt).toLocaleString()}
                </p>
                <Link
                  href={`/admin/tickets/${ticket._id}`}
                  className="inline-block px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  View
                </Link>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>
            {Array.from({ length: pageCount }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`px-3 py-1 rounded ${
                  num === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100'
                }`}
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, pageCount))}
              disabled={currentPage === pageCount}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}
