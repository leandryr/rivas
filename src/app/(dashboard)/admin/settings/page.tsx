// File: src/app/(dashboard)/admin/settings/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const hours = Array.from({ length: 24 }, (_, i) =>
  `${i.toString().padStart(2, '0')}:00`
)

export default function AdminSettingsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [availability, setAvailability] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)

  // Rango global para aplicar a todas las fechas del mes
  const [rangeStart, setRangeStart] = useState<string>('09:00')
  const [rangeEnd, setRangeEnd] = useState<string>('17:00')

  // -----------------------------
  // 1) Función para recargar desde el servidor
  // -----------------------------
  const loadAvailability = async () => {
    try {
      const res = await fetch('/api/admin/settings/availability')
      const { data } = await res.json()
      const map: Record<string, string[]> = {}
      data?.availability?.forEach((item: any) => {
        map[item.day] = item.hours
      })
      setAvailability(map)
    } catch {
      setAvailability({})
    }
  }

  // 2) Carga inicial
  useEffect(() => {
    loadAvailability()
  }, [])

  // 3) Oculta el toast tras 3s
  useEffect(() => {
    if (!showToast) return
    const t = setTimeout(() => setShowToast(false), 3000)
    return () => clearTimeout(t)
  }, [showToast])

  // 4) Deduce la clave 'YYYY-MM-DD' y las horas actuales
  const dateKey = selectedDate.toISOString().slice(0, 10)
  const selectedHoursForDate = availability[dateKey] ?? []

  // 5) Alterna una hora en la fecha actual
  const toggleHour = (hour: string) => {
    setAvailability(prev => {
      const curr = prev[dateKey] ?? []
      const updated = curr.includes(hour)
        ? curr.filter(h => h !== hour)
        : [...curr, hour].sort()
      return { ...prev, [dateKey]: updated }
    })
  }

  // 6) Select/Deselect todas las horas de la fecha
  const selectAllHoursForDate = () => {
    setAvailability(prev => ({ ...prev, [dateKey]: [...hours] }))
  }
  const deselectAllHoursForDate = () => {
    setAvailability(prev => ({ ...prev, [dateKey]: [] }))
  }

  // 7) Copiar horas de la fecha a todo el mes
  const applyToMonth = () => {
    const [year, month] = dateKey.split('-').map(Number)
    const daysInMonth = new Date(year, month, 0).getDate()
    setAvailability(prev => {
      const updated = { ...prev }
      const base = prev[dateKey] ?? []
      for (let d = 1; d <= daysInMonth; d++) {
        const key = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        updated[key] = [...base]
      }
      return updated
    })
  }

  // 8) Aplicar rango (start–end) a todo el mes
  const applyRangeToMonth = () => {
    const [year, month] = dateKey.split('-').map(Number)
    const daysInMonth = new Date(year, month, 0).getDate()
    const allHours = hours.filter(h => h >= rangeStart && h <= rangeEnd)
    setAvailability(prev => {
      const updated = { ...prev }
      for (let d = 1; d <= daysInMonth; d++) {
        const key = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        updated[key] = [...allHours]
      }
      return updated
    })
  }

  // -----------------------------
  // 9) Guardar y recargar configuración
  // -----------------------------
  const handleSave = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/settings/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(availability),
      })
      if (!res.ok) throw new Error('Error al guardar disponibilidad')
      setShowToast(true)
      await loadAvailability()  // <--- recarga para que la UI refleje lo realmente guardado
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Error al guardar disponibilidad')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6 relative">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        Configurar disponibilidad por fecha
      </h1>

      {/* Calendario */}
      <div>
        <Label>Selecciona fecha</Label>
        <Calendar
          onChange={(value, _event) => {
            if (value instanceof Date) {
              setSelectedDate(value)
            }
          }}
          value={selectedDate}
        />
      </div>

      {/* Acciones rápidas */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={selectAllHoursForDate}>
          Seleccionar todas
        </Button>
        <Button size="sm" variant="outline" onClick={deselectAllHoursForDate}>
          Deseleccionar todas
        </Button>
        <Button size="sm" variant="ghost" onClick={applyToMonth}>
          Aplicar a todo el mes
        </Button>
      </div>

      {/* Rango de horas para todo el mes */}
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <Label>De</Label>
          <select
            className="border rounded p-2"
            value={rangeStart}
            onChange={e => setRangeStart(e.target.value)}
          >
            {hours.map(h => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>A</Label>
          <select
            className="border rounded p-2"
            value={rangeEnd}
            onChange={e => setRangeEnd(e.target.value)}
          >
            {hours.map(h => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>
        <Button size="sm" variant="secondary" onClick={applyRangeToMonth}>
          Rango a todo el mes
        </Button>
      </div>

      {/* Horas día a día */}
      <div>
        <Label className="mt-4">
          Horas disponibles para {selectedDate.toLocaleDateString()}
        </Label>
        <div className="grid grid-cols-4 gap-2 mt-2">
          {hours.map(hour => {
            const isSelected = selectedHoursForDate.includes(hour)
            return (
              <button
                key={hour}
                type="button"
                onClick={() => toggleHour(hour)}
                className={`text-xs px-2 py-1 rounded border transition ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-700'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300'
                }`}
              >
                {hour}
              </button>
            )
          })}
        </div>
      </div>

      {/* Guardar */}
      <div className="pt-4">
        <Button onClick={handleSave} disabled={loading} className="px-6 py-2">
          {loading ? 'Guardando...' : 'Guardar disponibilidad'}
        </Button>
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 bg-white dark:bg-gray-800 border border-green-300 px-4 py-3 rounded shadow-lg flex items-center space-x-2">
          <svg
            className="w-5 h-5 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm font-medium text-green-700">
            Disponibilidad guardada correctamente
          </span>
        </div>
      )}
    </div>
  )
}
