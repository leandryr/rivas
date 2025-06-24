// src/app/client/invoices/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface InvoiceSummary {
  _id: string
  invoiceNumber: number
  invoiceDate: string
  total: number
}

export default function ClientInvoicesPage() {
  const [invs, setInvs] = useState<InvoiceSummary[]>([])
  const router = useRouter()

  useEffect(() => {
    fetch('/api/client/invoices')
      .then((r) => r.json())
      .then(setInvs)
  }, [])

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl md:text-3xl font-bold">Invoices</h1>
      <div className="space-y-4">
        {invs.map((inv) => (
          <div
            key={inv._id}
            className="bg-white border rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between"
          >
            {/* Izquierda */}
            <div className="space-y-1">
              <p className="text-lg font-medium">Invoice #{inv.invoiceNumber}</p>
              <p className="text-sm text-gray-500">
                {new Date(inv.invoiceDate).toLocaleDateString()}
              </p>
            </div>
            {/* Derecha */}
            <div className="mt-4 md:mt-0 flex flex-col md:flex-row md:items-center md:space-x-4">
              <p className="text-xl font-semibold text-gray-800">
                ${inv.total.toFixed(2)}
              </p>
              <Button
                size="sm"
                onClick={() => router.push(`/client/invoices/${inv._id}`)}
              >
                View
              </Button>
            </div>
          </div>
        ))}
        {invs.length === 0 && (
          <p className="text-center text-gray-500 py-8">No hay facturas aún.</p>
        )}
      </div>
    </div>
  )
}
