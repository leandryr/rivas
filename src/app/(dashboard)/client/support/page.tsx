'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { listTickets } from '@/actions/tickets/listTickets'

interface Ticket {
  _id: string
  subject: string
  status: 'open' | 'closed'
  updatedAt: string
  name?: string
  email?: string
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState('')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      try {
        const result = await listTickets()
        if (!('error' in result)) {
          setTickets(result.tickets || [])
        } else {
          console.error('Error loading tickets:', result.error)
        }
      } catch (err) {
        console.error('Unexpected error:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    const msg = searchParams.get('success')
    if (msg) {
      setSuccessMessage(
        msg === 'created' ? '✅ Ticket creado correctamente' : msg
      )
      const timer = setTimeout(() => setSuccessMessage(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  // filter & pagination
  const filtered = tickets.filter(t =>
    `${t.subject} ${t.name ?? ''} ${t.email ?? ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )
  const pageCount = Math.ceil(filtered.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const paginated = filtered.slice(startIdx, startIdx + itemsPerPage)

  // reset page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold">
          Tickets de Soporte
        </h1>
        <div className="mt-4 sm:mt-0 text-sm text-gray-700 text-right">
          <p className="mb-2">¿Tienes una consulta o inconveniente?</p>
          <button
            onClick={() => router.push('/client/support/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Crear nuevo ticket
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Buscar tickets por asunto, nombre o email..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full md:w-1/2 mb-6 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Success message */}
      {successMessage && (
        <div className="mb-6 px-4 py-2 bg-green-100 text-green-800 rounded">
          {successMessage}
        </div>
      )}

      {/* Loading / Empty */}
      {loading ? (
        <p className="text-center text-gray-600">Cargando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-600">
          No hay tickets que coincidan.
        </p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto mb-4">
            <table className="min-w-full bg-white divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {tickets[0]?.name && (
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                      Cliente
                    </th>
                  )}
                  {tickets[0]?.email && (
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                      Email
                    </th>
                  )}
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                    Asunto
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                    Estado
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                    Última actualización
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map(ticket => (
                  <tr key={ticket._id} className="hover:bg-gray-50">
                    {ticket.name && (
                      <td className="px-3 py-2 text-sm text-gray-800">
                        {ticket.name}
                      </td>
                    )}
                    {ticket.email && (
                      <td className="px-3 py-2 text-sm text-gray-800">
                        {ticket.email}
                      </td>
                    )}
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
                      {ticket.status === 'closed' ? 'Cerrado' : 'Abierto'}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-600">
                      {new Date(ticket.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Link
                        href={`/client/support/${ticket._id}`}
                        className="inline-block px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
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
                    {ticket.status === 'closed' ? 'Cerrado' : 'Abierto'}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-medium">Asunto:</span> {ticket.subject}
                </p>
                {ticket.name && (
                  <p className="text-sm text-gray-700 mb-1">
                    <span className="font-medium">Cliente:</span> {ticket.name}
                  </p>
                )}
                {ticket.email && (
                  <p className="text-sm text-gray-700 mb-1">
                    <span className="font-medium">Email:</span> {ticket.email}
                  </p>
                )}
                <p className="text-xs text-gray-500 mb-3">
                  Actualizado: {new Date(ticket.updatedAt).toLocaleString()}
                </p>
                <Link
                  href={`/client/support/${ticket._id}`}
                  className="inline-block px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Ver
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
