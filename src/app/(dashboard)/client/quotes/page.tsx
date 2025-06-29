// src/app/client/quotes/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSession } from 'next-auth/react'

interface QuoteSummary {
  _id: string
  subtotal: number
  taxAmount: number
  total: number
  status: 'pending' | 'accepted' | 'rejected' | 'paid'
  validUntil: string
  createdAt: string
}

export default function ClientQuotesPage() {
  const { status } = useSession()
  const router = useRouter()
  const [quotes, setQuotes] = useState<QuoteSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/client/quotes')
        .then(res => res.json())
        .then((data: QuoteSummary[]) => setQuotes(data))
        .finally(() => setLoading(false))
    }
  }, [status])

  if (status !== 'authenticated') {
    return <p className="p-4">Please sign in to view your quotes.</p>
  }
  if (loading) {
    return <p className="p-4">Loading…</p>
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Your Quotes</h1>

      {quotes.length === 0 ? (
        <p>You have no quotes at the moment.</p>
      ) : (
        <div className="space-y-4">
          {quotes.map(q => {
            const badgeVariant: 'default' | 'info' | 'success' | 'danger' =
              q.status === 'pending'   ? 'default' :
              q.status === 'accepted'  ? 'info'    :
              q.status === 'paid'      ? 'success' :
              /* rejected */            'danger'

            return (
              <div
                key={q._id}
                className="border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p>
                    <strong>Created:</strong>{' '}
                    {new Date(q.createdAt).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Valid Until:</strong>{' '}
                    {new Date(q.validUntil).toLocaleDateString()}
                  </p>
                  <p className="mt-1">
                    <Badge variant={badgeVariant}>{q.status}</Badge>
                  </p>
                </div>
                <div className="mt-3 md:mt-0 text-right">
                  <p className="font-medium">Total: ${q.total.toFixed(2)}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => router.push(`/client/quotes/${q._id}`)}
                  >
                    View
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
