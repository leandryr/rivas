// src/app/admin/quotes/[id]/page.tsx
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

interface Quote {
  _id: string
  client: { name: string; email: string }
  items: QuoteItem[]
  subtotal: number
  taxAmount: number
  total: number
  validUntil: string
  createdAt: string
  status: 'pending' | 'accepted' | 'rejected' | 'paid'
  invoiceNumber?: number
  invoiceDate?: string
  pdfUrl?: string
}

export default function AdminQuoteDetailPage() {
  const { id } = useParams()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [converting, setConverting] = useState(false)

  useEffect(() => {
    async function fetchQuote() {
      const res = await fetch(`/api/admin/quotes/${id}`)
      if (res.ok) {
        const data: Quote = await res.json()
        setQuote(data)
      }
      setLoading(false)
    }
    fetchQuote()
  }, [id])

  const handleConvertToInvoice = async () => {
    if (!quote) return
    setConverting(true)
    const res = await fetch(`/api/admin/quotes/${id}/convert`, {
      method: 'POST',
    })
    if (res.ok) {
      const data: Quote = await res.json()
      setQuote(data)
    } else {
      alert('Error converting quote.')
    }
    setConverting(false)
  }

  if (loading) return <p className="p-4">Loading...</p>
  if (!quote) return <p className="p-4">Quote not found.</p>

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Quote Detail</h1>
      <div className="space-y-2 border rounded p-4">
        <p>
          <strong>Client:</strong> {quote.client.name} ({quote.client.email})
        </p>
        <p>
          <strong>Valid Until:</strong>{' '}
          {new Date(quote.validUntil).toLocaleDateString()}
        </p>
        <p>
          <strong>Created:</strong>{' '}
          {new Date(quote.createdAt).toLocaleDateString()}
        </p>
        <p>
          <strong>Status:</strong> <Badge>{quote.status}</Badge>
        </p>
        {quote.invoiceNumber && (
          <>
            <p>
              <strong>Invoice #:</strong> {quote.invoiceNumber}
            </p>
            <p>
              <strong>Invoice Date:</strong>{' '}
              {new Date(quote.invoiceDate!).toLocaleDateString()}
            </p>
          </>
        )}
        <hr />
        <ul className="space-y-2">
          {quote.items.map((it, idx) => (
            <li key={idx} className="flex justify-between">
              <span>{it.title}</span>
              <span>
                ${it.price.toFixed(2)}{' '}
                {it.discount ? `(-${it.discount}%)` : ''}
              </span>
            </li>
          ))}
        </ul>
        <hr />
        <div className="text-right space-y-1 font-bold text-green-700">
          <p>Subtotal: ${quote.subtotal.toFixed(2)}</p>
          <p>Tax: ${quote.taxAmount.toFixed(2)}</p>
          <p>Total: ${quote.total.toFixed(2)}</p>
        </div>
      </div>

      {quote.status === 'accepted' && (
        <Button onClick={handleConvertToInvoice} disabled={converting}>
          {converting ? 'Converting...' : 'Convert to Invoice'}
        </Button>
      )}

      {quote.pdfUrl && (
        <Button asChild>
          <a href={quote.pdfUrl} target="_blank" rel="noopener noreferrer">
            Download PDF
          </a>
        </Button>
      )}
    </div>
  )
}
