'use client'

import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface PriceItem {
  _id?: string
  title: string
  description?: string
  price: number
  discount?: number
  category: string
  subcategory?: string
  unit?: string
  tags?: string[]
}

export default function PricingPage() {
  const [items, setItems] = useState<PriceItem[]>([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<PriceItem>({
    title: '',
    description: '',
    price: 0,
    discount: 0,
    category: '',
    subcategory: '',
    unit: 'project',
    tags: [],
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const itemsPerPage = 10

  useEffect(() => {
    fetch('/api/admin/pricing')
      .then(res => res.json())
      .then(data => setItems(data || []))
  }, [])

  const filteredItems = items.filter(i =>
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase()) ||
    i.subcategory?.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const totalItems = filteredItems.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      price: 0,
      discount: 0,
      category: '',
      subcategory: '',
      unit: 'project',
      tags: [],
    })
    setEditingId(null)
  }

  const handleSave = async () => {
    const method = editingId ? 'PUT' : 'POST'
    const url = editingId ? `/api/admin/pricing/${editingId}` : '/api/admin/pricing'
    const payload = {
      ...form,
      tags: form.tags?.map(tag => tag.trim()).filter(Boolean),
    }

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      const updated = await res.json()
      if (editingId) {
        setItems(prev => prev.map(i => (i._id === editingId ? updated : i)))
      } else {
        setItems(prev => [...prev, updated])
      }
      resetForm()
      setIsDialogOpen(false)
    }
  }

  const handleEdit = (item: PriceItem) => {
    setForm({ ...item, tags: item.tags || [] })
    setEditingId(item._id || null)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    await fetch(`/api/admin/pricing/${id}`, { method: 'DELETE' })
    setItems(prev => prev.filter(i => i._id !== id))
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search by title, category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-md"
        />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="flex gap-2"
              onClick={() => {
                resetForm()
                setIsDialogOpen(true)
              }}
            >
              <Plus size={18} /> Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <div className="space-y-4">
              <Label>Title</Label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <Label>Description</Label>
              <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <Label>Category</Label>
              <Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
              <Label>Subcategory</Label>
              <Input value={form.subcategory} onChange={e => setForm({ ...form, subcategory: e.target.value })} />
              <Label>Price ($)</Label>
              <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) })} />
              <Label>Discount (%)</Label>
              <Input type="number" value={form.discount || 0} onChange={e => setForm({ ...form, discount: parseFloat(e.target.value) })} />
              <Label>Unit</Label>
              <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="w-full border rounded p-2 dark:bg-gray-900 dark:text-white dark:border-gray-700">
                <option value="project">Project</option>
                <option value="hour">Hour</option>
                <option value="page">Page</option>
                <option value="unit">Unit</option>
                <option value="month">Month</option>
                <option value="custom">Custom</option>
              </select>
              <Label>Tags (comma separated)</Label>
              <Input value={form.tags?.join(', ') || ''} onChange={e => setForm({ ...form, tags: e.target.value.split(',').map(t => t.trim()) })} />
              <Button onClick={handleSave}>{editingId ? 'Update' : 'Create'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vista Desktop */}
      <div className="hidden md:block overflow-auto rounded-lg shadow border dark:border-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Subcategory</th>
              <th className="px-4 py-3 font-semibold">Unit</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Discount</th>
              <th className="px-4 py-3 font-semibold">Tags</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
            {paginatedItems.map(item => (
              <tr key={item._id}>
                <td className="px-4 py-2">{item.title}</td>
                <td className="px-4 py-2">{item.category}</td>
                <td className="px-4 py-2">{item.subcategory}</td>
                <td className="px-4 py-2">{item.unit}</td>
                <td className="px-4 py-2 font-bold text-green-700">${item.price}</td>
                <td className="px-4 py-2">{item.discount ? `${item.discount}%` : '—'}</td>
                <td className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400">{item.tags?.join(', ')}</td>
                <td className="px-4 py-2 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                    <Pencil size={14} />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(item._id!)}>
                    <Trash size={14} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista Móvil */}
      <div className="block md:hidden space-y-4">
        {paginatedItems.map(item => (
          <div key={item._id} className="border rounded p-4 shadow-sm bg-white dark:bg-gray-900 dark:border-gray-800">
            <h3 className="font-bold text-lg mb-1">{item.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{item.description}</p>
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
              <strong>Category:</strong> {item.category}{item.subcategory && ` / ${item.subcategory}`}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
              <strong>Price:</strong> ${item.price} {item.discount ? <span className="text-red-500 text-xs">({item.discount}% OFF)</span> : ''}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
              <strong>Unit:</strong> {item.unit}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              <strong>Tags:</strong> {item.tags?.join(', ')}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                <Pencil size={14} />
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(item._id!)}>
                <Trash size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Paginador */}
      <div className="flex items-center justify-between flex-wrap gap-4 mt-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>–
          <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of
          <span className="font-medium"> {totalItems}</span>
        </p>
        <div className="inline-flex items-center space-x-1 text-sm border rounded overflow-hidden dark:border-gray-700">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
            className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"
          >{'<'}</button>
          {[...Array(Math.min(3, totalPages))].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 ${
                currentPage === i + 1
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >{i + 1}</button>
          ))}
          {totalPages > 3 && <span className="px-2 py-1">...</span>}
          {totalPages > 3 && (
            <button
              onClick={() => setCurrentPage(totalPages)}
              className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700"
            >{totalPages}</button>
          )}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"
          >{'>'}</button>
        </div>
      </div>
    </div>
  )
}
