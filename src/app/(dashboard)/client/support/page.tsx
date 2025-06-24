'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import styles from './TicketsPage.module.css'
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
  const searchParams = useSearchParams()
  const router = useRouter()
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const result = await listTickets()
        if ('error' in result) {
          console.error('Error al cargar tickets:', result.error)
        } else {
          setTickets(result.tickets || [])
        }
      } catch (err) {
        console.error('Error inesperado:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const msg = searchParams.get('success')
    if (msg) {
      setSuccessMessage(msg === 'created' ? '✅ Ticket creado correctamente' : msg)
      const timer = setTimeout(() => setSuccessMessage(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  const filteredTickets = tickets.filter(t =>
    t.subject.toLowerCase().includes(search.toLowerCase()) ||
    t.email?.toLowerCase().includes(search.toLowerCase()) ||
    t.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Tickets de Soporte</h1>
        <div className={styles.createWrapper}>
          <p className={styles.createHint}>¿Tienes una consulta o inconveniente?</p>
          <button
            onClick={() => router.push('/client/support/new')}
            className={styles.createButton}
          >
            Crear nuevo ticket
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Buscar tickets por asunto, nombre o email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={styles.searchInput}
      />

      {successMessage && <div className={styles.successModal}>{successMessage}</div>}

      {loading ? (
        <p>Cargando...</p>
      ) : filteredTickets.length === 0 ? (
        <p>No hay tickets que coincidan.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              {tickets[0]?.name && <th>Cliente</th>}
              {tickets[0]?.email && <th>Email</th>}
              <th>Asunto</th>
              <th>Estado</th>
              <th>Última actualización</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map(ticket => (
              <tr key={ticket._id}>
                {ticket.name && <td>{ticket.name}</td>}
                {ticket.email && <td>{ticket.email}</td>}
                <td>{ticket.subject}</td>
                <td className={ticket.status === 'closed' ? styles.closed : styles.open}>
                  {ticket.status === 'closed' ? 'Cerrado' : 'Abierto'}
                </td>
                <td>{new Date(ticket.updatedAt).toLocaleString()}</td>
                <td>
                  <Link href={`/client/support/${ticket._id}`} className={styles.viewLink}>
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
