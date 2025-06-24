// src/components/CommentsSection.tsx
'use client'

import { useEffect, useState } from 'react'
import Avatar from '@/components/ui/avatar'

interface Comment {
  _id: string
  author: { name: string; image?: string | null }
  text: string
  createdAt: string
}

interface Props {
  postId: string
}

export default function CommentsSection({ postId }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(5)

  useEffect(() => {
    fetchComments()
  }, [])

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?postId=${postId}`)
      if (res.ok) setComments(await res.json())
    } catch {
      /* silent */
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim() || !text.trim()) {
      setError('Nombre y comentario son obligatorios.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, name, text }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || 'Error publicando.')
      else {
        setName('')
        setText('')
        fetchComments()
      }
    } catch {
      setError('Error de red.')
    } finally {
      setLoading(false)
    }
  }

  const hasMore = comments.length > visibleCount
  const visible = comments.slice(-visibleCount)

  return (
    <section className="pt-8 border-t">
      <h2 className="text-2xl font-semibold mb-4 flex justify-between">
        Discussion <span className="text-gray-500">({comments.length})</span>
      </h2>

      {/* Contenedor con scroll */}
      <div className="bg-white rounded-lg shadow divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
        {visible.length === 0 && (
          <p className="p-4 text-gray-500 italic">Sé el primero en comentar.</p>
        )}
        {visible.map(c => (
          <div key={c._id} className="p-4 flex space-x-3">
            <Avatar src={c.author.image ?? ''} alt={c.author.name} size={40} />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{c.author.name}</span>
                <span className="text-xs text-gray-400">
                  · {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-1 text-gray-800">{c.text}</p>
            </div>
          </div>
        ))}
        {hasMore && (
          <button
            onClick={() => setVisibleCount(v => v + 5)}
            className="w-full py-2 text-center text-sm text-blue-600 hover:bg-gray-50"
          >
            Ver más comentarios
          </button>
        )}
      </div>

      {/* Formulario fijo al fondo */}
      <form
        onSubmit={handleSubmit}
        className="mt-4 flex items-start space-x-3 sticky bottom-0 bg-white pt-4"
      >
        <Avatar src={undefined} alt="Tu avatar" size={40} />
        <div className="flex-1 space-y-2">
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <input
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={loading}
            className="w-full border rounded px-3 py-2 focus:outline-none"
          />
          <div className="flex">
            <textarea
              placeholder="Escribe un comentario..."
              rows={1}
              value={text}
              onChange={e => setText(e.target.value)}
              disabled={loading}
              className="flex-1 border rounded-l px-3 py-2 resize-none focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '…' : 'Publicar'}
            </button>
          </div>
        </div>
      </form>
    </section>
  )
}
