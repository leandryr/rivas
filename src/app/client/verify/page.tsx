// File: /src/app/client/verify/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Spinner from '@/components/ui/Spinner'
import EmailVerification from '@/components/client/verify/EmailVerification'
import PaymentMethodVerification from '@/components/client/verify/PaymentMethodVerification'

interface IUserMeResponse {
  user: {
    email: string
    isEmailVerified: boolean
    settings?: {
      hasValidPaymentMethod?: boolean
    }
  }
}

export default function VerificationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)
  const [paymentVerified, setPaymentVerified] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Al montar, traemos user/me para saber estados
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/users/me')
        if (!res.ok) throw new Error('Failed to load user')
        const json: IUserMeResponse = await res.json()
        const u = json.user

        setEmail(u.email || '')
        setEmailVerified(!!u.isEmailVerified)
        setPaymentVerified(!!u.settings?.hasValidPaymentMethod)
      } catch (err: any) {
        console.error(err)
        setFetchError('Error loading user data')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  // Callback cuando el e-mail se ha verificado correctamente
  const handleEmailVerified = async () => {
    try {
      // Llamada a nuestro endpoint para marcar isEmailVerified en la BD
      const res = await fetch('/api/users/verify-email', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('Failed to mark email verified')

      // Actualizo estado local
      setEmailVerified(true)
    } catch (err) {
      console.error(err)
      // Podrías mostrar un toast de error
    }
  }

  // Callback cuando el método de pago se ha guardado exitosamente
  const handlePaymentVerified = async () => {
    try {
      // Llamada a nuestro endpoint para marcar hasValidPaymentMethod en la BD
      const res = await fetch('/api/users/verify-payment-method', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('Failed to mark payment verified')

      // Actualizo estado local
      setPaymentVerified(true)
    } catch (err) {
      console.error(err)
      // Podrías mostrar un toast de error
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Spinner label="Loading verification details..." />
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="max-w-md mx-auto mt-10 p-4 bg-red-100 text-red-700 rounded">
        <p>{fetchError}</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow mt-6 space-y-8">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
        Account Verification
      </h1>

      {/* === Verificación de Email === */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Email Verification</h2>
        {emailVerified ? (
          <div className="flex items-center gap-2 text-green-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>Primary email has been verified</span>
          </div>
        ) : (
          <EmailVerification email={email} onVerified={handleEmailVerified} />
        )}
      </div>

      {/* === Verificación de Método de Pago === */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Payment Method</h2>
        {paymentVerified ? (
          <div className="flex items-center gap-2 text-green-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>Your payment method is verified</span>
          </div>
        ) : (
          <PaymentMethodVerification
            isVerified={paymentVerified}
            onVerified={handlePaymentVerified}
          />
        )}
      </div>
    </div>
  )
}
