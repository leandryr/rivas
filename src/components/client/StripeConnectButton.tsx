'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function StripeConnectButton() {
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/stripe/client-connect')
      const { url, error } = await res.json()
      if (!url) throw new Error(error || 'Stripe onboarding failed')
      window.location.href = url
    } catch (err) {
      console.error(err)
      alert('No se pudo iniciar Stripe. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleConnect} disabled={loading}>
      {loading ? 'Conectando…' : 'Conectar cuenta Stripe'}
    </Button>
  )
}
