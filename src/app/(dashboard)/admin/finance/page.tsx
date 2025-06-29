// File: src/app/(dashboard)/admin/finance/page.tsx
'use client'

import React, { useEffect, useMemo, useState, FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

// --- Local types ---
type ExpenseType = 'Expense' | 'Investment'

interface Summary {
  totalPaid: number
  totalExpenses: number
  totalInvestments: number
  netProfit: number
}

interface IExpense {
  _id: string
  date: string       // ISO string
  amount: number
  type: ExpenseType
  description?: string
}

// --- Hook to detect mobile layout ---
function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [breakpoint])
  return isMobile
}

export default function AdminFinancePage() {
  const isMobile = useIsMobile()

  // --- State declarations ---
  const [summary, setSummary] = useState<Summary | null>(null)
  const [items, setItems] = useState<IExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // --- Form visibility (mobile only) ---
  const [showHistoryOnly, setShowHistoryOnly] = useState(true)

  // --- Form fields ---
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [amount, setAmount] = useState(0)
  const [type, setType] = useState<ExpenseType>('Expense')
  const [description, setDescription] = useState('')

  // --- Load data from API ---
  const loadData = async () => {
    setLoading(true)
    try {
      const [resSum, resHist] = await Promise.all([
        fetch('/api/admin/expenses/finance/summary'),
        fetch('/api/admin/expenses'),
      ])
      if (!resSum.ok) throw new Error(`Summary fetch failed (${resSum.status})`)
      if (!resHist.ok) throw new Error(`History fetch failed (${resHist.status})`)

      const sumBody = await resSum.json()
      const histBody = await resHist.json()
      if (!sumBody.success) throw new Error(sumBody.error || 'Invalid summary')
      if (!histBody.success) throw new Error(histBody.error || 'Invalid history')

      setSummary(sumBody.data)
      setItems(histBody.data)
      setCurrentPage(1)
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Error loading data')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { loadData() }, [])

  // --- Filter + Paginate memoized ---
  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return items.filter(it => {
      const ds = new Date(it.date).toLocaleDateString().toLowerCase()
      return ds.includes(term)
        || it.type.toLowerCase().includes(term)
        || (it.description || '').toLowerCase().includes(term)
    })
  }, [items, searchTerm])

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filtered.slice(start, start + itemsPerPage)
  }, [filtered, currentPage])

  // --- Export CSV for backup ---
  const exportCSV = () => {
    const header = ['Date','Type','Amount','Description']
    const rows = filtered.map(it => [
      new Date(it.date).toLocaleDateString(),
      it.type,
      it.amount.toFixed(2),
      it.description || ''
    ])
    const csv = [header, ...rows]
      .map(r => r.map(c => `"${c.replace(/"/g,'""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `history_${new Date().toISOString().slice(0,10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // --- Handle form submit (new record) ---
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!date || amount <= 0) {
      toast.error('Please select a date and an amount > 0.')
      return
    }
    try {
      const res = await fetch('/api/admin/expenses', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ date, amount, type, description })
      })
      const body = await res.json()
      if (!body.success) throw new Error(body.error || 'Save failed')
      toast.success('Record saved.')
      setAmount(0); setDescription('')
      await loadData()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Error saving')
    }
  }

  if (loading) {
    return <p className="p-6 text-center text-gray-500 dark:text-gray-400">Loading…</p>
  }

  // --- Mobile layout ---
  if (isMobile) {
    return (
      <div className="p-4 pb-28 bg-gray-50 dark:bg-gray-900 min-h-screen space-y-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">LLC Finance</h1>

        <div className="flex justify-between">
          <Button size="sm" variant="outline" onClick={() => setShowHistoryOnly(h => !h)}>
            {showHistoryOnly ? 'Show Form' : 'Hide Form'}
          </Button>
          <Button size="sm" variant="outline" onClick={exportCSV}>
            Export CSV
          </Button>
        </div>

        {!showHistoryOnly && (
          <form onSubmit={onSubmit} className="space-y-3 bg-white dark:bg-gray-800 p-4 rounded shadow">
            <Label className="dark:text-gray-200">Date</Label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full border rounded p-2 bg-white dark:bg-gray-700 dark:border-gray-600"
              required
            />
            <Label className="dark:text-gray-200">Amount</Label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(+e.target.value)}
              className="w-full border rounded p-2 bg-white dark:bg-gray-700 dark:border-gray-600"
              step="0.01"
              min="0"
              required
            />
            <Label className="dark:text-gray-200">Type</Label>
            <select
              value={type}
              onChange={e => setType(e.target.value as ExpenseType)}
              className="w-full border rounded p-2 bg-white dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="Expense">Expense</option>
              <option value="Investment">Investment</option>
            </select>
            <Label className="dark:text-gray-200">Description (optional)</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Additional details"
            />
            <Button type="submit" className="w-full">Save</Button>
          </form>
        )}

        <div className="space-y-2">
          <Label className="dark:text-gray-200">Search History</Label>
          <input
            type="text"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1) }}
            placeholder="Filter by date/type/description…"
            className="w-full border rounded p-2 bg-white dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">History</h2>
          <ul className="divide-y bg-white dark:bg-gray-800 rounded shadow mt-2">
            {paginatedItems.map(it => (
              <li key={it._id} className="py-3 px-4 flex justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(it.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{it.type}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">
                    ${it.amount.toFixed(2)}
                  </p>
                  {it.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {it.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="flex justify-center items-center space-x-4 mt-4">
            <Button size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
              Previous
            </Button>
            <span className="text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <Button size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // --- Desktop layout ---
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">LLC Finance</h1>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-6">
        <div className="p-4 bg-white dark:bg-gray-800 border rounded shadow">
          <Label className="dark:text-gray-200">Total Invoices Paid</Label>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            ${(summary?.totalPaid ?? 0).toFixed(2)}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 border rounded shadow">
          <Label className="dark:text-gray-200">Total Expenses</Label>
          <p className="text-2xl font-semibold text-red-600">
            ${(summary?.totalExpenses ?? 0).toFixed(2)}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 border rounded shadow">
          <Label className="dark:text-gray-200">Total Investments</Label>
          <p className="text-2xl font-semibold text-green-600">
            ${(summary?.totalInvestments ?? 0).toFixed(2)}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 border rounded shadow">
          <Label className="dark:text-gray-200">Available Balance</Label>
          <p className="text-2xl font-semibold text-blue-600">
            ${(summary?.netProfit ?? 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Record form */}
        <form onSubmit={onSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded shadow">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Record Expense / Investment</h2>
          <div>
            <Label className="dark:text-gray-200">Date</Label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full border rounded p-2 bg-white dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>
          <div>
            <Label className="dark:text-gray-200">Amount</Label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(+e.target.value)}
              className="w-full border rounded p-2 bg-white dark:bg-gray-700 dark:border-gray-600"
              step="0.01"
              min="0"
              required
            />
          </div>
          <div>
            <Label className="dark:text-gray-200">Type</Label>
            <select
              value={type}
              onChange={e => setType(e.target.value as ExpenseType)}
              className="w-full border rounded p-2 bg-white dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="Expense">Expense</option>
              <option value="Investment">Investment</option>
            </select>
          </div>
          <div>
            <Label className="dark:text-gray-200">Description (optional)</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Additional details"
            />
          </div>
          <Button type="submit">Save</Button>
        </form>

        {/* Search + Export CSV (Desktop Only) */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex-1 mr-4">
                <Label className="block mb-1 text-gray-700 dark:text-gray-300 font-medium">
                  Search History
                </Label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                  placeholder="Filter by date/type/description…"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>

              {/* black “Export CSV” button, same height as input */}
              <Button
                onClick={exportCSV}
                className="inline-flex items-center px-2 py-5 bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 text-white font-medium rounded-md shadow transition-colors duration-150"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M4 12l4 4m0 0l4-4m-4 4V4"
                  />
                </svg>
                Export CSV
              </Button>
            </div>

          {/* History table */}
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded shadow">
            <table className="w-full table-auto border-collapse">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="border p-2 text-left dark:text-gray-200">Date</th>
                  <th className="border p-2 text-left dark:text-gray-200">Type</th>
                  <th className="border p-2 text-right dark:text-gray-200">Amount</th>
                  <th className="border p-2 text-left dark:text-gray-200">Description</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map(it => (
                  <tr key={it._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="border p-2 dark:text-gray-100">
                      {new Date(it.date).toLocaleDateString()}
                    </td>
                    <td className="border p-2 dark:text-gray-100">{it.type}</td>
                    <td className="border p-2 text-right dark:text-gray-100">
                      ${it.amount.toFixed(2)}
                    </td>
                    <td className="border p-2 dark:text-gray-100">{it.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          <div className="flex justify-end items-center space-x-4 mt-4">
            <Button size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
              Previous
            </Button>
            <span className="text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <Button size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
