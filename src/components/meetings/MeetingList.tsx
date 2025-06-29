// File: src/components/meetings/MeetingList.tsx
'use client'

import React, { useState, useEffect } from 'react'
import {
  updateMeetingAction,
  cancelMeetingAction,
} from '@/actions/meetingClientActions'

interface Meeting {
  _id: string
  projectId: string
  userId: string
  date: string
  reason?: string
  status: 'Pendiente' | 'Confirmada' | 'Cancelada'
  link?: string
  createdAt: string
  updatedAt: string
}

interface ProjectOption {
  _id: string
  title: string
}

interface MeetingListProps {
  userId: string
}

export function MeetingList({ userId }: MeetingListProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [projectsMap, setProjectsMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [newDate, setNewDate] = useState('')
  const [newReason, setNewReason] = useState('')

  // 1) Cargar proyectos y construir un mapa id → título
useEffect(() => {
  fetch(`/api/projects?userId=${userId}`)
    .then(res => res.json())
    .then((data: ProjectOption[]) => {
      const map: Record<string, string> = {}
      data.forEach(p => { map[p._id] = p.title })
      setProjectsMap(map)
    })
    .catch(e => {
      console.error('[MeetingList] proyectos:', e)
      setProjectsMap({})
    })
}, [userId])

  // 2) Cargar reuniones
  useEffect(() => {
    fetch(`/api/meetings?userId=${userId}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: any[]) => {
        setMeetings(
          data.map(m => ({
            _id: m._id,
            projectId: m.projectId,
            userId: m.userId,
            date: m.date,
            reason: m.reason || '',
            status: m.status,
            link: m.link || '',
            createdAt: m.createdAt,
            updatedAt: m.updatedAt,
          }))
        )
      })
      .catch(e => {
        console.error('[MeetingList] cargando reuniones:', e)
        setError('No se pudieron cargar las reuniones.')
      })
      .finally(() => setLoading(false))
  }, [userId])

  const handleCancel = async (meetingId: string) => {
    if (!confirm('¿Cancelar esta reunión?')) return
    const formData = new FormData()
    formData.append('meetingId', meetingId)
    try {
      await cancelMeetingAction(formData)
      setMeetings(prev => prev.filter(m => m._id !== meetingId))
    } catch (e) {
      console.error(e)
      alert('Error al cancelar')
    }
  }

  const startEdit = (m: Meeting) => {
    setEditId(m._id)
    setNewDate(m.date.slice(0, 16))
    setNewReason(m.reason || '')
  }

  const submitEdit = async (meetingId: string) => {
    const formData = new FormData()
    formData.append('meetingId', meetingId)
    formData.append('date', newDate)
    formData.append('reason', newReason)
    try {
      await updateMeetingAction(formData)
      setMeetings(prev =>
        prev.map(m =>
          m._id === meetingId
            ? { ...m, date: new Date(newDate).toISOString(), reason: newReason }
            : m
        )
      )
      setEditId(null)
    } catch (e) {
      console.error(e)
      alert('Error al modificar')
    }
  }

  if (loading) return <p className="text-gray-500 text-sm">Cargando reuniones…</p>
  if (error) return <p className="text-red-500 text-sm">{error}</p>
  if (meetings.length === 0)
    return <p className="text-gray-500 text-sm">No tienes reuniones agendadas.</p>

  return (
    <ul className="space-y-6">
      {meetings.map(m => {
        const fecha = new Date(m.date)
        const fechaLocal = fecha.toLocaleDateString('es-ES')
        const horaLocal = fecha.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        })
        const projectTitle = projectsMap[m.projectId] ?? '—'

        return (
          <li
            key={m._id}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow-sm"
          >
            {editId === m._id ? (
              <form
                onSubmit={e => {
                  e.preventDefault()
                  submitEdit(m._id)
                }}
                className="space-y-4"
              >
                {/* ... formulario de edición ... */}
              </form>
            ) : (
              <div className="space-y-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-gray-800 dark:text-gray-100">
                      <span className="font-medium">Fecha:</span> {fechaLocal}
                    </p>
                    <p className="text-sm text-gray-800 dark:text-gray-100">
                      <span className="font-medium">Hora:</span> {horaLocal}
                    </p>
                    <p className="text-sm text-gray-800 dark:text-gray-100">
                      <span className="font-medium">Proyecto:</span> {projectTitle}
                    </p>
                    <p className="text-sm text-gray-800 dark:text-gray-100">
                      <span className="font-medium">Motivo:</span>{' '}
                      {m.reason || 'Sin motivo'}
                    </p>
                    <p className="text-sm text-gray-800 dark:text-gray-100">
                      <span className="font-medium">Estado:</span> {m.status}
                    </p>
                    {m.status === 'Confirmada' && m.link && (
                      <p className="text-sm text-gray-800 dark:text-gray-100">
                        <span className="font-medium">Enlace:</span>{' '}
                        <a
                          href={m.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {m.link}
                        </a>
                      </p>
                    )}
                  </div>
                  <div className="mt-4 md:mt-0 flex gap-2">
                    {m.status === 'Pendiente' && (
                      <button
                        onClick={() => startEdit(m)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium px-4 py-2 rounded-md"
                      >
                        Modificar
                      </button>
                    )}
                    {(m.status === 'Pendiente' || m.status === 'Confirmada') && (
                      <button
                        onClick={() => handleCancel(m._id)}
                        className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-md"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
