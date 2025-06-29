// src/app/client/payments/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Quote {
  _id: string
  total: number
  createdAt: string
  status: 'accepted' | 'paid'
  paymentRequested?: boolean
}

type ManualMethod = 'cash' | 'transfer' | 'cheque'
const MANUAL_LABELS: Record<ManualMethod, string> = {
  cash:     'Efectivo',
  transfer: 'Transferencia',
  cheque:   'Cheque',
}

export default function PaymentsPage() {
  const { status } = useSession()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [stripeOpen, setStripeOpen] = useState(false)
  const [paypalOpen, setPaypalOpen] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)

  // Carga cotizaciones pendientes
  useEffect(() => {
    if (status !== 'authenticated') return
    ;(async () => {
      try {
        const res = await fetch('/api/client/quotes')
        const data: Quote[] = await res.json()
        const pending = data.filter(q => q.status === 'accepted' && !q.paymentRequested)
        setQuotes(pending)
      } catch {
        toast.error('No se pudieron cargar cotizaciones')
      }
    })()
  }, [status])

  if (status !== 'authenticated') {
    return <p className="p-4">Inicia sesión para gestionar pagos.</p>
  }

  const openStripe = (q: Quote) => {
    setSelectedQuote(q)
    setStripeOpen(true)
  }
  const openPaypal = (q: Quote) => {
    setSelectedQuote(q)
    setPaypalOpen(true)
  }
  const openManual = (q: Quote) => {
    setSelectedQuote(q)
    setManualOpen(true)
  }

  const recordManual = async (method: ManualMethod) => {
    if (!selectedQuote) return
    try {
      const res = await fetch(
        `/api/client/quotes/${selectedQuote._id}/payment-request`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ method }),
        }
      )
      if (!res.ok) throw new Error()
      toast.success('Solicitud enviada')
      setQuotes(prev => prev.filter(q => q._id !== selectedQuote._id))
      setManualOpen(false)
      setSelectedQuote(null)
    } catch {
      toast.error('Error al enviar solicitud')
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Pagos pendientes</h1>
      {quotes.length === 0 ? (
        <p>No tienes solicitudes de pago pendientes.</p>
      ) : (
        <div className="space-y-4">
          {quotes.map(q => (
            <div
              key={q._id}
              className="border rounded p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">#{q._id}</p>
                <p>Monto: ${q.total.toFixed(2)}</p>
              </div>
              <div className="flex space-x-2">
                <Button onClick={() => openStripe(q)}>
                  <img src="/stripe-logo.png" alt="Stripe" className="h-5" />
                </Button>
                <Button onClick={() => openPaypal(q)}>
                  <img src="/paypal-logo.png" alt="PayPal" className="h-5" />
                </Button>
                <Button onClick={() => openManual(q)}>
                  Otros
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {stripeOpen && selectedQuote && (
        <StripeModal
          quote={selectedQuote}
          onClose={() => {
            setStripeOpen(false)
            setSelectedQuote(null)
          }}
        />
      )}
      {paypalOpen && selectedQuote && (
        <PaypalModal
          quote={selectedQuote}
          onClose={() => {
            setPaypalOpen(false)
            setSelectedQuote(null)
          }}
        />
      )}
      {manualOpen && selectedQuote && (
        <ManualModal
          quote={selectedQuote}
          onClose={() => {
            setManualOpen(false)
            setSelectedQuote(null)
          }}
          onSelect={recordManual}
        />
      )}
    </div>
  )
}

// ------------------ StripeModal ------------------

function StripeModal({
  quote,
  onClose,
}: {
  quote: Quote
  onClose: () => void
}) {
  const handlePay = async () => {
    const res = await fetch(`/api/client/quotes/${quote._id}/pay`, {
      method: 'POST',
    })
    if (res.ok) {
      const { url } = await res.json()
      window.location.href = url
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-80 p-6 bg-white rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Stripe Checkout</h2>
        <p className="mb-4">Pagar ${quote.total.toFixed(2)}</p>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handlePay}>Pagar</Button>
        </div>
      </div>
    </div>
  )
}

// ------------------ PaypalModal ------------------

function PaypalModal({
  quote,
  onClose,
}: {
  quote: Quote
  onClose: () => void
}) {
  const handlePay = async () => {
    const res = await fetch(`/api/client/quotes/${quote._id}/paypal-pay`, {
      method: 'POST',
    })
    if (res.ok) {
      const { url } = await res.json()
      window.location.href = url
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-80 p-6 bg-white rounded-lg">
        <h2 className="text-lg font-semibold mb-4">PayPal Checkout</h2>
        <p className="mb-4">Pagar ${quote.total.toFixed(2)}</p>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handlePay}>Pagar</Button>
        </div>
      </div>
    </div>
  )
}

// ------------------ ManualModal ------------------

function ManualModal({
  quote,
  onClose,
  onSelect,
}: {
  quote: Quote
  onClose: () => void
  onSelect: (method: ManualMethod) => void
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-80 p-6 bg-white rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Métodos Manuales</h2>
        <p className="mb-4">Cotización #{quote._id}</p>
        <div className="space-y-2">
          {(['cash','transfer','cheque'] as ManualMethod[]).map(m => (
            <Button key={m} onClick={() => onSelect(m)}>
              {MANUAL_LABELS[m]}
            </Button>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  )
}
