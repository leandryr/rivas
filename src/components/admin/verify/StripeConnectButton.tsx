// src/components/admin/verify/StripeConnectButton.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function StripeConnectButton() {
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/stripe/connect')
      const { url } = await res.json()
      if (!url) throw new Error('Stripe onboarding failed')
      window.location.href = url
    } catch (err) {
      console.error(err)
      alert('Error connecting to Stripe.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={loading}
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      {loading ? 'Connecting...' : 'Connect Stripe Account'}
    </Button>
  )
}
