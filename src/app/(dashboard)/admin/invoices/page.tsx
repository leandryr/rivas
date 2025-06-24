// src/app/admin/invoices/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface InvoiceSummary {
  _id: string
  invoiceNumber: number
  invoiceDate: string
  total: number
  client: { name: string; email: string }
}

export default function AdminInvoicesPage() {
  const [invs, setInvs] = useState<InvoiceSummary[]>([])
  const router = useRouter()

  useEffect(() => {
    fetch('/api/admin/invoices')
      .then(r => r.json())
      .then(setInvs)
  }, [])

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invoices</h1>
      </div>

      {invs.length === 0 ? (
        <p>No invoices found.</p>
      ) : (
        <div className="overflow-auto border rounded shadow">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {invs.map(inv => (
                <tr key={inv._id}>
                  <td className="px-4 py-2">{inv.invoiceNumber}</td>
                  <td className="px-4 py-2">{inv.client.name}</td>
                  <td className="px-4 py-2 text-gray-500">{inv.client.email}</td>
                  <td className="px-4 py-2">
                    {new Date(inv.invoiceDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 font-bold text-green-700">
                    ${inv.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/invoices/${inv._id}`)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
