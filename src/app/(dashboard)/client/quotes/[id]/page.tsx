// src/app/client/quotes/[id]/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface QuoteItem {
  title: string
  price: number
  discount?: number
}

interface QuoteDetail {
  _id: string
  items: QuoteItem[]
  subtotal: number
  taxAmount: number
  total: number
  notes?: string
  validUntil: string
  createdAt: string
  status: 'pending' | 'accepted' | 'rejected' | 'paid'
  invoiceNumber?: number
  invoiceDate?: string
  pdfUrl?: string
}

export default function ClientQuoteDetailPage() {
  const { id } = useParams()
  const [quote, setQuote] = useState<QuoteDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actioning, setActioning] = useState(false)

  useEffect(() => {
    fetch(`/api/client/quotes/${id}`)
      .then(res => res.json())
      .then((data: QuoteDetail) => setQuote(data))
      .finally(() => setLoading(false))
  }, [id])

  const handleAction = async (action: 'accept' | 'reject' | 'pay') => {
    if (!quote) return
    setActioning(true)
    const res = await fetch(`/api/client/quotes/${id}/${action}`, { method: 'POST' })
    if (res.ok) {
      const updated = await res.json()
      if (action === 'pay') {
        const { url } = updated as any
        window.location.href = url
        return
      }
      setQuote(updated as QuoteDetail)
    } else {
      alert('Error performing action')
    }
    setActioning(false)
  }

  if (loading) return <p className="p-4">Loading…</p>
  if (!quote) return <p className="p-4">Quote not found.</p>

  // Variantes válidas para Badge: default, success, warning, danger, info
  const badgeVariant: 'default' | 'success' | 'warning' | 'danger' | 'info' =
    quote.status === 'pending'  ? 'default' :
    quote.status === 'accepted' ? 'info'    :
    quote.status === 'paid'     ? 'success' :
    quote.status === 'rejected' ? 'danger'  :
    'default'

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Quote Details</h1>

      <div className="space-y-2 border rounded p-4">
        {quote.items.map((it, i) => (
          <div key={i} className="flex justify-between">
            <span>{it.title}</span>
            <span>
              ${(it.price * (1 - (it.discount ?? 0) / 100)).toFixed(2)}
            </span>
          </div>
        ))}
        <hr className="my-2" />
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${quote.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax:</span>
          <span>${quote.taxAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-green-700">
          <span>Total:</span>
          <span>${quote.total.toFixed(2)}</span>
        </div>
        {quote.notes && (
          <p className="mt-2">
            <strong>Notes:</strong> {quote.notes}
          </p>
        )}
        <p>
          <strong>Status:</strong>{' '}
          <Badge variant={badgeVariant}>
            {quote.status}
          </Badge>
        </p>
        {quote.invoiceNumber && (
          <p>
            <strong>Invoice #:</strong> {quote.invoiceNumber}
          </p>
        )}
        {quote.invoiceDate && (
          <p>
            <strong>Invoice Date:</strong>{' '}
            {new Date(quote.invoiceDate).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {quote.status === 'pending' && (
          <>
            <Button
              disabled={actioning}
              onClick={() => handleAction('accept')}
            >
              {actioning ? 'Processing…' : 'Accept'}
            </Button>
            <Button
              variant="destructive"
              disabled={actioning}
              onClick={() => handleAction('reject')}
            >
              {actioning ? 'Processing…' : 'Reject'}
            </Button>
          </>
        )}
        {quote.status === 'accepted' && (
          <Button
            disabled={actioning}
            onClick={() => handleAction('pay')}
          >
            {actioning ? 'Redirecting…' : 'Pay'}
          </Button>
        )}
        {quote.pdfUrl && (
          <Button asChild>
            <a
              href={quote.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download Invoice PDF
            </a>
          </Button>
        )}
      </div>
    </div>
  )
}
