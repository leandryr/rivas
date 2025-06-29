// File: src/components/meetings/MeetingForm.tsx
'use client'

import React, { useState, useEffect, FormEvent } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createMeetingAction } from '@/actions/meetingClientActions'

interface ProjectOption {
  _id: string
  title: string
}

interface AvailabilityItem {
  day: string        // e.g. "2025-06-24"
  hours: string[]    // e.g. ["09:00","10:00",…]
}

interface Meeting {
  _id: string
  date: string       // ISO string
}

interface MeetingFormProps {
  userId: string
}

export default function MeetingForm({ userId }: MeetingFormProps) {
  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [selectedProject, setSelectedProject] = useState('')

  const [availability, setAvailability] = useState<Record<string, string[]>>({})
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true)

  const [allMeetings, setAllMeetings] = useState<Meeting[]>([])
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(true)

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedHour, setSelectedHour] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Helpers to reload data
  const loadProjects = async () => {
    if (!userId) return
    setIsLoadingProjects(true)
    try {
      const res = await fetch(`/api/projects?userId=${userId}`)
      const data: ProjectOption[] = await res.json()
      setProjects(data)
      if (data.length === 1) {
        setSelectedProject(data[0]._id)
      }
    } catch {
      setProjects([])
    } finally {
      setIsLoadingProjects(false)
    }
  }

  const loadAvailability = async () => {
    setIsLoadingAvailability(true)
    try {
      const res = await fetch('/api/admin/settings/availability')
      const body = await res.json()
      const map: Record<string, string[]> = {}
      body.data.availability.forEach((item: AvailabilityItem) => {
        map[item.day] = item.hours
      })
      setAvailability(map)
    } catch {
      setAvailability({})
    } finally {
      setIsLoadingAvailability(false)
    }
  }

  const loadMeetings = async () => {
    setIsLoadingMeetings(true)
    try {
      const res = await fetch('/api/meetings')
      const data: Meeting[] = await res.json()
      setAllMeetings(data)
    } catch {
      setAllMeetings([])
    } finally {
      setIsLoadingMeetings(false)
    }
  }

  // 1️⃣ Load on mount
  useEffect(() => {
    loadProjects()
    loadAvailability()
    loadMeetings()
  }, [userId])

  // 2️⃣ Reload availability when month/year changes
  useEffect(() => {
    loadAvailability()
    // clear selection when changing month
    setSelectedHour('')
    setError(null)
  }, [selectedDate.getMonth(), selectedDate.getFullYear()])

  // 3️⃣ Date key
  const dateKey = selectedDate.toISOString().slice(0, 10)

  // 4️⃣ All slots for that day
  const allSlots = availability[dateKey] ?? []

  // 5️⃣ Occupied hours on that day
  const occupied = allMeetings
    .filter(m => m.date.slice(0, 10) === dateKey)
    .map(m => m.date.slice(11, 16))

  // 6️⃣ Filter out occupied
  let freeSlots = allSlots.filter(slot => !occupied.includes(slot))

  // 7️⃣ Also filter out past hours if today
  const now = new Date()
  const todayKey = now.toISOString().slice(0, 10)
  const nowHour = now.toTimeString().slice(0, 5)
  if (dateKey === todayKey) {
    freeSlots = freeSlots.filter(slot => slot >= nowHour)
  }

  // 8️⃣ Handle form submit
  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!selectedProject || !selectedHour) {
      setError('Selecciona proyecto, fecha y hora')
      return
    }
    setIsSubmitting(true)

    // Build full Date
    const [h, m] = selectedHour.split(':').map(Number)
    const dt = new Date(selectedDate)
    dt.setHours(h, m, 0, 0)

    const formData = new FormData()
    formData.append('projectId', selectedProject)
    formData.append('userId', userId)
    formData.append('date', dt.toISOString())
    formData.append('reason', reason)

    try {
      const newId = await createMeetingAction(formData)

      // Optimistic update: add to meetings and remove slot
      setAllMeetings(prev => [...prev, { _id: newId, date: dt.toISOString() }])
      setAvailability(prev => ({
        ...prev,
        [dateKey]: prev[dateKey].filter(s => s !== selectedHour),
      }))
      setSelectedHour('')
    } catch (err: any) {
      setError(err.message || 'Error al crear reunión')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
        Agendar nueva reunión
      </h2>

      {/* Proyecto */}
      <div>
        <Label>Proyecto</Label>
        <select
          className="w-full border rounded p-2"
          value={selectedProject}
          onChange={e => setSelectedProject(e.target.value)}
          disabled={isLoadingProjects}
          required
        >
          <option value="">
            {isLoadingProjects ? 'Cargando proyectos...' : '-- Selecciona un proyecto --'}
          </option>
          {projects.map(p => (
            <option key={p._id} value={p._id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      {/* Calendario */}
      <div>
        <Label>Fecha</Label>
        <Calendar
          onChange={d => {
            if (d instanceof Date) {
              setSelectedDate(d)
            }
          }}
          value={selectedDate}
          tileDisabled={({ date }) => {
            if (isLoadingAvailability) return true
            const key = date.toISOString().slice(0, 10)
            return !(availability[key]?.length > 0)
          }}
        />
      </div>

      {/* Horas disponibles */}
      <div>
        <Label>Hora</Label>
        {isLoadingMeetings || isLoadingAvailability ? (
          <p className="text-gray-500">Cargando horas...</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {freeSlots.length === 0 ? (
              <p className="col-span-3 text-gray-500">
                No hay horas disponibles este día.
              </p>
            ) : (
              freeSlots.map(slot => (
                <Button
                  key={slot}
                  type="button"
                  variant={selectedHour === slot ? 'default' : 'outline'}
                  onClick={() => setSelectedHour(slot)}
                  aria-selected={selectedHour === slot}
                  disabled={isSubmitting}
                >
                  {slot}
                </Button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Motivo */}
      <div>
        <Label>Motivo (opcional)</Label>
        <Textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Detalles adicionales"
          disabled={isSubmitting}
        />
      </div>

      {/* Error */}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Botón */}
      <Button
        type="submit"
        disabled={
          !selectedProject || !selectedHour || isSubmitting || isLoadingProjects
        }
        className="w-full"
      >
        {isSubmitting ? 'Agendando...' : 'Agendar'}
      </Button>
    </form>
  )
}
