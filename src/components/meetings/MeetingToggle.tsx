'use client'

import { useState } from 'react'
import MeetingForm from './MeetingForm'

interface MeetingToggleProps {
  userId: string
}

export default function MeetingToggle({ userId }: MeetingToggleProps) {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="w-full">
      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded shadow transition-all"
        >
          Agendar nueva reunión
        </button>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded p-4 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Agendar nueva reunión
            </h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-gray-600 dark:text-gray-300 hover:text-red-500 text-2xl font-bold leading-none"
              aria-label="Cerrar formulario"
            >
              ×
            </button>
          </div>
          <MeetingForm userId={userId} />
        </div>
      )}
    </div>
  )
}
