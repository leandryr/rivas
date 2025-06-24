'use client'

import { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import SetupForm from './SetupForm'

interface Props {
  isVerified: boolean
  onVerified: () => void
}

interface SetupIntentResponse {
  clientSecret: string | null
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

export default function PaymentMethodVerification({ isVerified, onVerified }: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isVerified) {
      const fetchSetupIntent = async () => {
        setLoading(true)
        try {
          const res = await fetch('/api/stripe/create-setup-intent', {
            method: 'POST',
          })
          const data: SetupIntentResponse = await res.json()
          setClientSecret(data.clientSecret)
        } catch (error) {
          console.error('Failed to fetch setup intent:', error)
          setClientSecret(null)
        } finally {
          setLoading(false)
        }
      }
      fetchSetupIntent()
    }
  }, [isVerified])

  if (loading) {
    return <p className="text-gray-500">Initializing Stripe…</p>
  }

  if (!clientSecret) {
    return <p className="text-red-600">😕 Could not initialize Stripe.</p>
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <SetupForm clientSecret={clientSecret} onSuccess={onVerified} />
    </Elements>
  )
}
