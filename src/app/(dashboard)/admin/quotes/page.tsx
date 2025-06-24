// src/app/admin/quotes/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash, Eye } from 'lucide-react'

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
  notes?: string
  validUntil: string
  status: 'pending' | 'accepted' | 'rejected' | 'paid'
  invoiceNumber?: number
  invoiceDate?: string
  pdfUrl?: string
  createdAt: string
}

interface User {
  _id: string
  name: string
  email: string
}

interface PriceItem {
  _id: string
  title: string
  description?: string
  price: number
  discount?: number
  category?: string
  subcategory?: string
}

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [clients, setClients] = useState<User[]>([])
  const [items, setItems] = useState<PriceItem[]>([])
  const [filteredItems, setFilteredItems] = useState<PriceItem[]>([])
  const [selectedClientId, setSelectedClientId] = useState('')
  const [selectedItems, setSelectedItems] = useState<PriceItem[]>([])
  const [notes, setNotes] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const [qRes, uRes, pRes] = await Promise.all([
        fetch('/api/admin/quotes'),
        fetch('/api/users'),
        fetch('/api/admin/pricing'),
      ])
      const [qData, uData, pData] = await Promise.all([
        qRes.json(),
        uRes.json(),
        pRes.json(),
      ])
      setQuotes(qData)
      setClients(uData)
      setItems(pData)
      setFilteredItems(pData)
    }
    fetchData()
  }, [])

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * (1 - (item.discount ?? 0) / 100),
    0
  )
  const taxAmount = parseFloat((subtotal * 0.07).toFixed(2))
  const total = parseFloat((subtotal + taxAmount).toFixed(2))

  const handleCreateQuote = async () => {
    if (!selectedClientId || selectedItems.length === 0) {
      alert('Please select a client and at least one item.')
      return
    }
    setIsSubmitting(true)
    const res = await fetch('/api/admin/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: selectedClientId,
        items: selectedItems,
        notes,
        validUntil,
      }),
    })
    if (res.ok) {
      const newQuote: Quote = await res.json()
      setQuotes(prev => [newQuote, ...prev])
      setSelectedClientId('')
      setSelectedItems([])
      setNotes('')
      setValidUntil('')
      setIsCreateModalOpen(false)
    } else {
      alert('Error creating quote.')
    }
    setIsSubmitting(false)
  }

  const handleOpenQuoteModal = async (id: string) => {
    const res = await fetch(`/api/admin/quotes/${id}`)
    if (res.ok) {
      const data: Quote = await res.json()
      setSelectedQuote(data)
      setIsDetailModalOpen(true)
    } else {
      alert('Error loading quote.')
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header + New Quote */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quotes</h1>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>+ New Quote</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">New Quote</h2>
            <div className="space-y-4">
              {/* Cliente */}
              <div>
                <Label>Client</Label>
                <select
                  className="w-full border rounded p-2"
                  value={selectedClientId}
                  onChange={e => setSelectedClientId(e.target.value)}
                >
                  <option value="">Select a client</option>
                  {clients.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>
              {/* Items */}
              <div>
                <Label>Items</Label>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus size={16} className="mr-1" /> Add Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <Input
                      placeholder="Search..."
                      onChange={e => {
                        const term = e.target.value.toLowerCase()
                        setFilteredItems(
                          items.filter(item =>
                            [
                              item.title,
                              item.description,
                              item.category,
                              item.subcategory,
                            ]
                              .join(' ')
                              .toLowerCase()
                              .includes(term)
                          )
                        )
                      }}
                      className="mb-2"
                    />
                    <div className="space-y-2 max-h-[300px] overflow-y-auto border p-2 rounded">
                      {filteredItems.length === 0 && (
                        <p className="text-center text-gray-500">No items found.</p>
                      )}
                      {filteredItems.map(item => (
                        <div
                          key={item._id}
                          className="flex justify-between items-center border p-2 rounded"
                        >
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-gray-600">
                              ${item.price.toFixed(2)}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              if (!selectedItems.find(i => i._id === item._id)) {
                                setSelectedItems(prev => [...prev, item])
                              }
                            }}
                          >
                            Add
                          </Button>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
                {/* Seleccionados */}
                {selectedItems.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {selectedItems.map((item, i) => (
                      <div
                        key={item._id}
                        className="flex justify-between items-center border p-2 rounded"
                      >
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-gray-600">
                            ${item.price.toFixed(2)}{' '}
                            {item.discount ? `(-${item.discount}%)` : ''}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setSelectedItems(prev =>
                              prev.filter((_, idx) => idx !== i)
                            )
                          }
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Notes & Valid Until */}
              <div>
                <Label>Notes</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
              <div>
                <Label>Valid Until</Label>
                <Input
                  type="date"
                  value={validUntil}
                  onChange={e => setValidUntil(e.target.value)}
                />
              </div>
              {/* Totals */}
              <div className="space-y-1 text-right">
                <p>
                  Subtotal: <span className="font-medium">${subtotal.toFixed(2)}</span>
                </p>
                <p>
                  Tax (7%): <span className="font-medium">${taxAmount.toFixed(2)}</span>
                </p>
                <p className="font-bold text-green-700">Total: ${total.toFixed(2)}</p>
              </div>
              <Button onClick={handleCreateQuote} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Create Quote'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block border rounded shadow overflow-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Subtotal</th>
              <th className="px-4 py-3">Tax</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Valid Until</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y bg-white">
            {quotes.map(q => (
              <tr key={q._id}>
                <td className="px-4 py-2">{q.client.name}</td>
                <td className="px-4 py-2">{q.client.email}</td>
                <td className="px-4 py-2">${q.subtotal.toFixed(2)}</td>
                <td className="px-4 py-2">${q.taxAmount.toFixed(2)}</td>
                <td className="px-4 py-2 text-green-700 font-bold">
                  ${q.total.toFixed(2)}
                </td>
                <td className="px-4 py-2">{q.status}</td>
                <td className="px-4 py-2">
                  {new Date(q.validUntil).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">
                  {new Date(q.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenQuoteModal(q._id)}
                  >
                    <Eye size={16} className="mr-1" /> View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile List */}
      <div className="md:hidden space-y-4">
        {quotes.map(q => (
          <div key={q._id} className="border rounded p-4 shadow bg-white">
            <h2 className="font-bold text-lg mb-1">{q.client.name}</h2>
            <p className="text-sm text-gray-600 mb-1">{q.client.email}</p>
            <p className="text-sm mb-1">
              <strong>Status:</strong> {q.status}
            </p>
            <p className="text-sm mb-1">
              <strong>Total:</strong> ${q.total.toFixed(2)}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenQuoteModal(q._id)}
            >
              <Eye size={16} className="mr-1" /> View
            </Button>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedQuote ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Quote Details</h2>
              <p>
                <strong>Client:</strong> {selectedQuote.client.name} (
                {selectedQuote.client.email})
              </p>
              <p>
                <strong>Status:</strong> {selectedQuote.status}
              </p>
              <p>
                <strong>Valid Until:</strong>{' '}
                {new Date(selectedQuote.validUntil).toLocaleDateString()}
              </p>
              <p>
                <strong>Notes:</strong> {selectedQuote.notes || 'No notes'}
              </p>
              <div className="space-y-2">
                {selectedQuote.items.map((item, idx) => (
                  <div key={idx} className="border p-2 rounded">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-600">
                      ${item.price.toFixed(2)}{' '}
                      {item.discount ? `(-${item.discount}%)` : ''}
                    </p>
                  </div>
                ))}
              </div>
              <div className="text-right space-y-1 font-bold">
                <p>Subtotal: ${selectedQuote.subtotal.toFixed(2)}</p>
                <p>Tax: ${selectedQuote.taxAmount.toFixed(2)}</p>
                <p>Total: ${selectedQuote.total.toFixed(2)}</p>
              </div>
              {selectedQuote.invoiceNumber && (
                <p>
                  <strong>Invoice #:</strong> {selectedQuote.invoiceNumber}
                </p>
              )}
              {selectedQuote.invoiceDate && (
                <p>
                  <strong>Invoice Date:</strong>{' '}
                  {new Date(selectedQuote.invoiceDate).toLocaleDateString()}
                </p>
              )}
              {selectedQuote.pdfUrl && (
                <Button asChild>
                  <a
                    href={selectedQuote.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download PDF
                  </a>
                </Button>
              )}
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
