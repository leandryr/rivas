// src/app/admin/invoices/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

interface InvoiceItem {
  title: string
  price: number
  discount?: number
}

interface InvoiceDetail {
  invoiceNumber: number
  invoiceDate: string
  items: InvoiceItem[]
  subtotal: number
  taxAmount: number
  total: number
  client: { name: string; email: string }
  pdfUrl?: string
}

export default function AdminInvoiceDetailPage() {
  const { id } = useParams()
  const [inv, setInv] = useState<InvoiceDetail | null>(null)

  useEffect(() => {
    fetch(`/api/admin/invoices/${id}`)
      .then(r => r.json())
      .then(setInv)
      .catch(console.error)
  }, [id])

  if (!inv) return <p className="p-6">Loading…</p>
  if (!inv.invoiceNumber) return <p className="p-6">Invoice not found.</p>

  return (
    <div className="relative max-w-4xl mx-auto p-6 bg-white print:bg-white">
      {/* Watermark “PAID” solo al imprimir */}
      <div className="print:absolute print:inset-0 print:flex print:items-center print:justify-center pointer-events-none">
        <span className="text-9xl font-extrabold text-gray-300 opacity-20 -rotate-45">
          PAID
        </span>
      </div>

      {/* “Client Copy” solo al imprimir */}
      <div className="print:block hidden absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <span className="text-sm uppercase text-gray-500">Administrator Copy</span>
      </div>

      {/* Contenido (por encima del watermark) */}
      <div className="relative z-10 space-y-6">
        {/* Header */}
        <header className="flex justify-between items-center border-b pb-4 print:border-b-0">
          <div className="flex items-center">
            <Image
              src="/logo.webp"
              alt="Logo"
              width={120}
              height={60}
              className="object-contain"
            />
          </div>
          <div className="text-right text-sm space-y-1">
            <div className="font-bold text-lg">RIVAS TECHNOLOGIES LLC</div>
            <div>3005 Waterside Oaks Dr SW, Gainesville, GA 30504</div>
            <div>info@rivasdev.com</div>
            <div>+1 (404) 839-4292</div>
          </div>
        </header>

        {/* Metadatos e info del cliente */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold">
              Invoice #{inv.invoiceNumber}
            </h1>
            <p className="text-sm text-gray-600">
              Date: {new Date(inv.invoiceDate).toLocaleDateString()}
            </p>
          </div>
          <div className="text-sm">
            <p>
              <strong>Client:</strong> {inv.client.name}
            </p>
            <p>{inv.client.email}</p>
          </div>
        </div>

        {/* Tabla de ítems */}
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Item</th>
              <th className="border p-2 text-right">Price</th>
              <th className="border p-2 text-center">Qty</th>
              <th className="border p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {inv.items.map((item, idx) => {
              const lineTotal =
                item.price * (1 - (item.discount ?? 0) / 100)
              return (
                <tr key={idx} className="even:bg-gray-50">
                  <td className="border p-2">{item.title}</td>
                  <td className="border p-2 text-right">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="border p-2 text-center">1</td>
                  <td className="border p-2 text-right">
                    ${lineTotal.toFixed(2)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Totales */}
        <div className="text-right space-y-1 text-sm">
          <p>Subtotal: ${inv.subtotal.toFixed(2)}</p>
          <p>Tax: ${inv.taxAmount.toFixed(2)}</p>
          <p className="font-bold text-lg">Total: ${inv.total.toFixed(2)}</p>
        </div>

        {/* Botón imprimir (oculto al imprimir) */}
        <div className="text-center print:hidden">
          <Button onClick={() => window.print()}>
            Print / Save as PDF
          </Button>
        </div>

        {/* Incrustar PDF si existe URL */}
        {inv.pdfUrl && (
          <object
            data={inv.pdfUrl}
            type="application/pdf"
            width="100%"
            height="600"
            className="border mt-6"
          >
            <p>
              Your browser does not support PDF display.{' '}
              <a href={inv.pdfUrl} target="_blank" rel="noreferrer">
                Download PDF
              </a>
            </p>
          </object>
        )}
      </div>
    </div>
  )
}
