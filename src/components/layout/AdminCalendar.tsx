'use client'

import { useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import styles from './AdminCalendar.module.css'

interface Meeting {
  _id: string
  date: string
  clientName: string
  projectTitle: string
  meetLink?: string
}

export default function AdminCalendar() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    fetch('/api/admin/meetings')
      .then(res => res.json())
      .then(data => {
        const confirmed = data.meetings.filter((m: any) => m.status === 'confirmed')
        setMeetings(confirmed)
      })
  }, [])

  const tileContent = ({ date }: { date: Date }) => {
    const dateStr = date.toISOString().split('T')[0]
    const hasMeeting = meetings.some(m => m.date.startsWith(dateStr))
    return hasMeeting ? <div className={styles.dot} /> : null
  }

  const meetingsForSelected = meetings.filter(m =>
    selectedDate && m.date.startsWith(selectedDate.toISOString().split('T')[0])
  )

  return (
    <div className={styles.wrapper}>
      <h2>Calendario de Reuniones</h2>
      <Calendar
        onChange={value => setSelectedDate(value as Date)}
        tileContent={tileContent}
      />

      {selectedDate && (
        <div className={styles.details}>
          <h3>Reuniones del {selectedDate.toLocaleDateString()}</h3>
          {meetingsForSelected.length === 0 ? (
            <p>No hay reuniones.</p>
          ) : (
            <ul>
              {meetingsForSelected.map(m => (
                <li key={m._id}>
                  <strong>{new Date(m.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                  — {m.clientName} ({m.projectTitle})
                  {m.meetLink && (
                    <a href={m.meetLink} target="_blank" rel="noreferrer">[Link]</a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
