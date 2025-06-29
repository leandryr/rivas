// src/app/admin/payments/page.tsx
'use client'

import React, { useEffect, useState, FormEvent } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ClientInfo {
  _id: string
  name: string
  email: string
}

interface QuoteSummary {
  _id: string
  client: ClientInfo
  subtotal: number
  taxAmount: number
  total: number
  status: 'pending' | 'accepted' | 'rejected' | 'paid'
  validUntil: string
  createdAt: string
}

export default function AdminPaymentsPage() {
  const { status } = useSession()
  const [quotes, setQuotes] = useState<QuoteSummary[]>([])
  const [loading, setLoading] = useState(true)

  // Estado para el modal de pago
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<
    'cash' | 'cheque' | 'paypal' | 'stripe' | 'other'
  >('cash')
  const [reference, setReference] = useState('')
  const [saving, setSaving] = useState(false)

  // Estado para el modal de cliente
  const [clientModalOpen, setClientModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<ClientInfo | null>(null)

  // 1) Carga cotizaciones aceptadas (incluyendo client)
  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/admin/quotes?status=accepted')
        .then(res => res.json())
        .then((data: QuoteSummary[]) => setQuotes(data))
        .finally(() => setLoading(false))
    }
  }, [status])

  // 2) Abrir modal de pago
  const openPaymentModal = (id: string) => {
    setSelectedQuoteId(id)
    setPaymentMethod('cash')
    setReference('')
    setPaymentModalOpen(true)
  }

  // 3) Abrir modal de cliente
  const openClientModal = (client: ClientInfo) => {
    setSelectedClient(client)
    setClientModalOpen(true)
  }

  // 4) Enviar pago al backend
  const handleSubmitPayment = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedQuoteId) return
    setSaving(true)
    const res = await fetch(`/api/admin/quotes/${selectedQuoteId}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: paymentMethod, reference }),
    })
    if (res.ok) {
      // Actualiza solo el estado de la cotización marcada como pagada
      setQuotes(qs =>
        qs.map(q =>
          q._id === selectedQuoteId ? { ...q, status: 'paid' } : q
        )
      )
      setPaymentModalOpen(false)
    } else {
      alert('Error guardando el pago')
    }
    setSaving(false)
  }

  if (status !== 'authenticated') {
    return <p className="p-4">Debes iniciar sesión como admin para ver los pagos.</p>
  }
  if (loading) {
    return <p className="p-4">Cargando cotizaciones aceptadas…</p>
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Pagos Pendientes</h1>

      {quotes.length === 0 ? (
        <p>No hay cotizaciones aceptadas para pagar.</p>
      ) : (
        <div className="space-y-4">
          {quotes.map(q => {
            const badgeVariant: 'default' | 'info' | 'success' | 'danger' =
              q.status === 'accepted' ? 'info' :
              q.status === 'paid'     ? 'success' :
              'default'

            return (
              <div
                key={q._id}
                className="border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <p>
                    <strong>Creada:</strong>{' '}
                    {new Date(q.createdAt).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Válida hasta:</strong>{' '}
                    {new Date(q.validUntil).toLocaleDateString()}
                  </p>
                  <p className="mt-1">
                    <Badge variant={badgeVariant}>{q.status}</Badge>
                  </p>
                </div>
                <div className="mt-3 md:mt-0 flex flex-col items-end space-y-2">
                  <p className="font-medium">Total: ${q.total.toFixed(2)}</p>
                  {q.status === 'accepted' && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openClientModal(q.client)}
                      >
                        Ver cliente
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openPaymentModal(q._id)}
                      >
                        Marcar como pagada
                      </Button>
                    </div>
                  )}
                  {q.status === 'paid' && (
                    <span className="text-green-600 font-medium">¡Pagada!</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de pago */}
      {paymentModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Registrar pago</h2>
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <div>
                <label className="block font-medium mb-1">
                  Método de pago
                </label>
                <select
                  value={paymentMethod}
                  onChange={e => {
                    setPaymentMethod(
                      e.target.value as
                        | 'cash'
                        | 'cheque'
                        | 'paypal'
                        | 'stripe'
                        | 'other'
                    )
                    setReference('')
                  }}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="cash">Efectivo</option>
                  <option value="cheque">Cheque</option>
                  <option value="paypal">PayPal</option>
                  <option value="stripe">Stripe</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              {(paymentMethod === 'paypal' ||
                paymentMethod === 'stripe' ||
                paymentMethod === 'other') && (
                <div>
                  <label className="block font-medium mb-1">
                    Referencia de pago
                  </label>
                  <input
                    type="text"
                    value={reference}
                    onChange={e => setReference(e.target.value)}
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              )}

              {paymentMethod === 'cheque' && (
                <div>
                  <label className="block font-medium mb-1">
                    Número de cheque
                  </label>
                  <input
                    type="text"
                    value={reference}
                    onChange={e => setReference(e.target.value)}
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setPaymentModalOpen(false)}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Guardando…' : 'Guardar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de cliente */}
      {clientModalOpen && selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Detalle del cliente</h2>
            <p>
              <strong>Nombre:</strong> {selectedClient.name}
            </p>
            <p>
              <strong>Email:</strong> {selectedClient.email}
            </p>
            <div className="flex justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setClientModalOpen(false)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}