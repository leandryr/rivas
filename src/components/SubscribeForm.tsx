// src/components/SubscribeForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Loader2, Mail } from 'lucide-react'

export default function SubscribeForm() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('subscribedEmail')
    if (saved) {
      setEmail(saved)
      setSubscribed(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (!email.trim()) {
      setMessage('Email is required.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error || 'Subscription failed.')
      } else {
        setMessage(data.message || 'Successfully subscribed!')
        setSubscribed(true)
        localStorage.setItem('subscribedEmail', email.trim())
      }
    } catch {
      setMessage('Network error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full flex justify-center">
      {subscribed ? (
        // — Vista compacta cuando ya está suscrito —
        <div className="flex items-center w-full max-w-md overflow-hidden rounded shadow border border-gray-200">
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-3 py-2 text-xs bg-gray-100 text-gray-600 cursor-not-allowed"
          />
          <div className="flex items-center bg-green-500 text-white px-3 py-1 text-xs font-medium space-x-1">
            <CheckCircle className="w-4 h-4" />
            <span>Subscribed</span>
          </div>
        </div>
      ) : (
        // — Formulario estándar para nuevos suscriptores —
        <form
          onSubmit={handleSubmit}
          className="flex items-center w-full max-w-md overflow-hidden rounded shadow border border-gray-300"
        >
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-3 py-2 text-sm outline-none"
            disabled={loading}
            required
          />
          <button
            type="submit"
            className="flex items-center bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Mail className="w-4 h-4 mr-1 inline-block" />
                Subscribe
              </>
            )}
          </button>
        </form>
      )}

      {message && (
        <p className="mt-2 text-center text-sm text-red-600 w-full max-w-md">
          {message}
        </p>
      )}
    </div>
  )
}
