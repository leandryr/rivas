'use client'

import { useEffect, useState } from 'react'
import StripeConnectButton from './StripeConnectButton'

interface Props {
  isVerified: boolean
  onVerified: () => Promise<void>
}

export default function PaymentMethodVerification({ isVerified, onVerified }: Props) {
  const [status, setStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading')

  useEffect(() => {
    const checkStripeStatus = async () => {
      try {
        const res = await fetch('/api/admin/stripe/status')
        if (!res.ok) throw new Error('Failed to fetch Stripe status')
        const data = await res.json()
        const connected = data?.connected

        if (connected) {
          // Si está conectado, refrescamos para actualizar el estado en DB
          await fetch('/api/admin/stripe/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })
          await onVerified() // notifica al componente padre
        }

        setStatus(connected ? 'connected' : 'disconnected')
      } catch (err) {
        console.error(err)
        setStatus('disconnected')
      }
    }

    checkStripeStatus()
  }, [onVerified])

  if (status === 'loading') {
    return <p className="text-sm text-gray-500">Checking Stripe connection...</p>
  }

  return (
    <div className="border rounded-md p-4 mt-4 bg-white dark:bg-gray-900 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Payment Method</h3>
      {status === 'connected' ? (
        <p className="text-green-600 flex items-center gap-2">
          ✅ <span>Stripe account connected</span>
        </p>
      ) : (
        <>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            To receive payments from clients, please connect your Stripe account.
          </p>
          <StripeConnectButton />
        </>
      )}
    </div>
  )
}
