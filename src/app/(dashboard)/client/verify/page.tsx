'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Spinner from '@/components/ui/Spinner'
import EmailVerification from '@/components/client/verify/EmailVerification'
import { CheckCircle2 } from 'lucide-react'

interface IUserMeResponse {
  user: {
    email: string
    isEmailVerified: boolean
  }
}

export default function VerificationsPage() {
  const params = useSearchParams()
  const refresh = params.get('refresh') === '1'

  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/users/me')
      if (!res.ok) throw new Error('Failed to load user')
      const { user }: IUserMeResponse = await res.json()
      setEmail(user.email)
      setEmailVerified(user.isEmailVerified)
    } catch (err) {
      console.error(err)
      setFetchError('Error al cargar datos de usuario')
    }
  }

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      await fetchUser()
      setLoading(false)
    })()
  }, [refresh])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Spinner label="Cargando datos..." />
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="max-w-md mx-auto mt-10 p-4 bg-red-100 text-red-700 rounded">
        {fetchError}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow mt-6 space-y-8">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
        Verificación de Correo
      </h1>

      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
          Verificación de Email
        </h2>
        {emailVerified ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="w-5 h-5" />
            <span>Email verificado</span>
          </div>
        ) : (
          <EmailVerification
            email={email}
            onVerified={() => setEmailVerified(true)}
          />
        )}
      </div>
    </div>
  )
}
