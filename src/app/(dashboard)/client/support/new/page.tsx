'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTicket } from '@/actions/tickets/createTicket'

export default function SupportForm() {
  const router = useRouter()
  const [form, setForm] = useState({
    subject: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    const result = await createTicket(form)
    setLoading(false)

    if ('error' in result) {
      setError(result.error || 'Error al enviar el ticket')
    } else {
      setShowConfirm(false)
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        router.push('/client/support?success=created')
      }, 2000)
    }
  }

  return (
    <div className="max-w-lg mx-auto p-4 md:p-8 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-semibold mb-4">Formulario de Soporte</h1>

      {error && (
        <p className="mb-4 text-red-600">{error}</p>
      )}
      {showSuccess && (
        <div className="mb-4 px-4 py-2 bg-green-100 text-green-800 rounded">
          ✅ Ticket creado correctamente
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          setShowConfirm(true)
        }}
        className="space-y-4"
      >
        <input
          type="text"
          name="subject"
          placeholder="Asunto"
          value={form.subject}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          name="description"
          placeholder="Describe tu problema..."
          value={form.description}
          onChange={handleChange}
          required
          className="w-full h-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-11/12 max-w-md">
            <h2 className="text-xl font-semibold mb-2">
              ¿Confirmar envío del ticket?
            </h2>
            <p className="text-gray-700 mb-4">
              Revisaremos tu solicitud lo antes posible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
