'use client'

import { useState } from 'react'

interface MeetingStatusSelectProps {
  meetingId: string
  currentStatus: 'Pendiente' | 'Confirmada' | 'Cancelada'
  currentLink?: string
}

export default function MeetingStatusSelect({
  meetingId,
  currentStatus,
  currentLink = '',
}: MeetingStatusSelectProps) {
  const [status, setStatus] = useState(currentStatus)
  const [showModal, setShowModal] = useState(false)
  const [link, setLink] = useState(currentLink)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as 'Pendiente' | 'Confirmada' | 'Cancelada'

    if (newStatus === 'Confirmada') {
      if (link && link.trim() !== '') {
        await updateStatus({ status: 'Confirmada', link })
      } else {
        setShowModal(true)
      }
    } else {
      await updateStatus({ status: newStatus, link: '' })
    }
  }

  const updateStatus = async (payload: { status: string; link?: string }) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || 'Error al actualizar estado.')
      }

      setStatus(payload.status as any)
      if (payload.status === 'Confirmada' && payload.link) {
        setLink(payload.link)
      } else {
        setLink('')
      }
      setShowModal(false)
    } catch (err: any) {
      console.error('[MeetingStatusSelect]', err)
      setError(err.message || 'Error desconocido.')
    } finally {
      setLoading(false)
    }
  }

  const onConfirmarLink = async () => {
    if (!link || link.trim() === '') {
      setError('Debes ingresar un enlace válido.')
      return
    }
    await updateStatus({ status: 'Confirmada', link })
  }

  return (
    <div className="relative w-full">
      <select
        name="status"
        value={status}
        onChange={onStatusChange}
        disabled={loading}
        className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring focus:ring-blue-500"
      >
        <option value="Pendiente">Pendiente</option>
        <option value="Confirmada">Confirmada</option>
        <option value="Cancelada">Cancelada</option>
      </select>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded shadow-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Agregar enlace de Meet/Zoom
            </h3>
            <input
              type="text"
              placeholder="Pega aquí el enlace"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              disabled={loading}
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false)
                  setError(null)
                }}
                className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onConfirmarLink}
                className="px-4 py-2 text-sm rounded bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar enlace'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
