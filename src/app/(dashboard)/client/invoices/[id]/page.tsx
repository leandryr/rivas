// src/app/client/invoices/[id]/page.tsx
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
}

export default function ClientInvoicePage() {
  const { id } = useParams()
  const [inv, setInv] = useState<InvoiceDetail | null>(null)

  useEffect(() => {
    fetch(`/api/client/invoices/${id}`)
      .then(r => r.json())
      .then(setInv)
  }, [id])

  if (!inv) return <p className="p-6">Loading…</p>

  return (
    <div className="relative max-w-3xl mx-auto p-6 bg-white print:bg-white">
      {/* --- CLIENT COPY: SOLO EN IMPRESIÓN --- */}
      <div className="print:block hidden absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <span className="text-sm uppercase text-gray-500">Client Copy</span>
      </div>

      {/* --- WATERMARK “PAID”: SOLO EN IMPRESIÓN, DETRÁS DEL CONTENIDO --- */}
      <div className="print:absolute print:inset-0 print:flex print:items-center print:justify-center pointer-events-none">
        <span className="text-9xl font-extrabold text-gray-300 opacity-20 -rotate-45">
          PAID
        </span>
      </div>

      {/* --- CONTENIDO PRINCIPAL (encima del watermark) --- */}
      <div className="relative z-10">
        {/* HEADER */}
        <header className="flex justify-between items-center mb-8 border-b pb-4 print:border-b-0 print:mb-4">
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
            <div className="text-lg font-bold">RIVAS TECNOLOGIES LLC</div>
            <div>3005 Waterside Oaks Dr SW, Gainesville, GA 30504</div>
            <div>info@rivasdev.com</div>
            <div>+1 (404) 839-4292</div>
          </div>
        </header>

        {/* METADATOS DE LA FACTURA */}
        <section className="mb-6 print:mb-4">
          <h1 className="text-2xl font-semibold mb-1">
            Invoice #{inv.invoiceNumber}
          </h1>
          <div className="text-sm text-gray-600">
            Date: {new Date(inv.invoiceDate).toLocaleDateString()}
          </div>
        </section>

        {/* ITEMS */}
        <table className="w-full border-collapse mb-6 print:mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-3 py-2 text-left">Item</th>
              <th className="border px-3 py-2 text-right">Price</th>
              <th className="border px-3 py-2 text-center">Qty</th>
              <th className="border px-3 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {inv.items.map((item, i) => {
              const lineTotal =
                item.price * (1 - (item.discount ?? 0) / 100)
              return (
                <tr key={i} className="even:bg-gray-50">
                  <td className="border px-3 py-2">{item.title}</td>
                  <td className="border px-3 py-2 text-right">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="border px-3 py-2 text-center">1</td>
                  <td className="border px-3 py-2 text-right">
                    ${lineTotal.toFixed(2)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* TOTALES */}
        <div className="text-right space-y-1 text-sm mb-6 print:mb-4">
          <div>Subtotal: ${inv.subtotal.toFixed(2)}</div>
          <div>Tax: ${inv.taxAmount.toFixed(2)}</div>
          <div className="text-lg font-bold">
            Total: ${inv.total.toFixed(2)}
          </div>
        </div>

        {/* BOTÓN IMPRIMIR (oculto en PDF) */}
        <div className="text-center print:hidden">
          <Button onClick={() => window.print()}>
            Print / Save as PDF
          </Button>
        </div>
      </div>
    </div>
  )
}
