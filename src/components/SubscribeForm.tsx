'use client'

import { useState } from 'react'

export default function SubscribeForm() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    // aquí podrías llamar a tu API /api/subscribe
    setSubmitted(true)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {submitted ? (
        <p className="text-green-600">Thanks for subscribing!</p>
      ) : (
        <>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full border rounded p-2"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          >
            Subscribe
          </button>
        </>
      )}
    </form>
  )
}
