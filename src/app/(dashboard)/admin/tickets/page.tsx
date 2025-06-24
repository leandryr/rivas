'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import styles from './TicketsPage.module.css'
import { listTickets } from '@/actions/tickets/listTickets' // ✅ añadido

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
  const router = useRouter()
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const [showSuccess, setShowSuccess] = useState(!!success)

  useEffect(() => {
    const fetchData = async () => {
      const data = await listTickets() // ✅ llamado al action server
      if ('error' in data) {
        console.error('Error al cargar tickets:', data.error) // ✅ validación
        return
      }
      setTickets(data?.tickets ?? []) // ✅ defensa contra undefined
      setLoading(false)
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [showSuccess])

  const filtered = tickets.filter(ticket =>
    `${ticket.name} ${ticket.email} ${ticket.subject}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Tickets de Soporte</h1>

      {showSuccess && (
        <div className={styles.successModal}>
          {success === 'closed'
            ? '✅ Ticket cerrado correctamente'
            : '✅ Acción completada con éxito'}
        </div>
      )}

      <input
        type="text"
        className={styles.searchInput}
        placeholder="Buscar por cliente, email o asunto..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {loading ? (
        <p>Cargando...</p>
      ) : filtered.length === 0 ? (
        <p>No hay tickets que coincidan con la búsqueda.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th className={styles.th}>ID</th>
                <th className={styles.th}>Cliente</th>
                <th className={styles.th}>Email</th>
                <th className={styles.th}>Asunto</th>
                <th className={styles.th}>Estado</th>
                <th className={styles.th}>Última actualización</th>
                <th className={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(ticket => (
                <tr key={ticket._id}>
                  <td className={styles.td}>{ticket._id.slice(-6)}</td>
                  <td className={styles.td}>{ticket.name}</td>
                  <td className={styles.td}>{ticket.email}</td>
                  <td className={styles.td}>{ticket.subject}</td>
                  <td className={`${styles.td} ${ticket.status === 'closed' ? styles.statusClosed : styles.statusOpen}`}>
                    {ticket.status === 'closed' ? 'Cerrado' : 'Abierto'}
                  </td>
                  <td className={styles.td}>
                    {new Date(ticket.updatedAt).toLocaleString()}
                  </td>
                  <td className={`${styles.td} ${styles.tdCenter}`}>
                    <Link
                      href={`/admin/tickets/${ticket._id}`}
                      className={styles.viewButton}
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
