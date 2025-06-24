'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Spinner from '@/components/ui/Spinner'
import EmailVerification from '@/components/client/verify/EmailVerification'
import PaymentMethodVerification from '@/components/admin/verify/PaymentMethodVerification'
import { Button } from '@/components/ui/button'
import { TrashIcon } from 'lucide-react'
import ModalConfirmDelete from '@/components/ui/ModalConfirmDelete'

interface IUserMeResponse {
  user: {
    email: string
    isEmailVerified: boolean
    hasValidPaymentMethod?: boolean
    paymentMethodDetails?: {
      last4?: string
      brand?: string
      expMonth?: number
      expYear?: number
    }
  }
}

export default function AdminVerificationsPage() {
  const router = useRouter()
  const params = useSearchParams()

  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)
  const [paymentVerified, setPaymentVerified] = useState(false)
  const [last4, setLast4] = useState<string | null>(null)
  const [brand, setBrand] = useState<string | null>(null)
  const [expMonth, setExpMonth] = useState<number | null>(null)
  const [expYear, setExpYear] = useState<number | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [showModal, setShowModal] = useState(false)
  const [removing, setRemoving] = useState(false)

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/users/me')
      if (!res.ok) throw new Error('Failed to load user')
      const json: IUserMeResponse = await res.json()
      const u = json.user

      setEmail(u.email || '')
      setEmailVerified(!!u.isEmailVerified)
      setPaymentVerified(!!u.hasValidPaymentMethod)
      setLast4(u.paymentMethodDetails?.last4 || null)
      setBrand(u.paymentMethodDetails?.brand || null)
      setExpMonth(u.paymentMethodDetails?.expMonth || null)
      setExpYear(u.paymentMethodDetails?.expYear || null)
    } catch (err) {
      console.error(err)
      setFetchError('Error loading user data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  // Refrescar Stripe status al volver del onboarding
  useEffect(() => {
    const shouldRefresh = params.get('refresh')
    if (shouldRefresh) {
      fetch('/api/admin/stripe/refresh', { method: 'POST' })
        .then(() => fetchUser())
        .catch(err => console.error('Refresh failed', err))
    }
  }, [params])

  const handleEmailVerified = async () => {
    try {
      const res = await fetch('/api/users/verify', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('Failed to mark email verified')
      setEmailVerified(true)
    } catch (err) {
      console.error(err)
    }
  }

  const handlePaymentVerified = async () => {
    try {
      const res = await fetch('/api/users/mark-payment-verified', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('Failed to mark payment verified')
      setPaymentVerified(true)
      router.refresh()
    } catch (err) {
      console.error(err)
    }
  }

  const handleRemovePaymentMethod = async () => {
    try {
      setRemoving(true)
      const res = await fetch('/api/users/remove-payment-method', {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to remove payment method')
      setShowModal(false)
      setPaymentVerified(false)
      setLast4(null)
      setBrand(null)
      setExpMonth(null)
      setExpYear(null)
    } catch (err) {
      console.error(err)
    } finally {
      setRemoving(false)
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
        Admin Account Verification
      </h1>

      {/* === Email === */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Email Verification</h2>
        {emailVerified ? (
          <div className="flex items-center gap-2 text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Primary email has been verified</span>
          </div>
        ) : (
          <EmailVerification email={email} onVerified={handleEmailVerified} />
        )}
      </div>

      {/* === Payment Method === */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Payment Method</h2>

        {paymentVerified ? (
          <div className="space-y-2 text-green-600">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Your payment method is verified</span>
            </div>
            {(last4 || brand || expMonth) && (
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {brand?.toUpperCase() || 'Card'} ending in {last4}
                {expMonth && expYear ? ` — Exp: ${expMonth}/${expYear}` : ''}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <TrashIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span>Remove</span>
            </Button>
            <ModalConfirmDelete
              open={showModal}
              onClose={() => setShowModal(false)}
              onConfirm={handleRemovePaymentMethod}
            />
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
