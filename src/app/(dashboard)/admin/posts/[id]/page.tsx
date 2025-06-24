// src/app/admin/posts/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Input }  from '@/components/ui/input'
import { Label }  from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface PostForm {
  title: string
  slug: string
  excerpt: string
  content: string
  tags: string
  status: 'draft' | 'published'
  coverImageUrl?: string    // nuevo
  youtubeLink?: string      // nuevo
}

export default function AdminPostEditPage() {
  const { id } = useParams()
  const router = useRouter()
  const isNew = id === 'new'

  const [form, setForm] = useState<PostForm>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    tags: '',
    status: 'draft',
    coverImageUrl: '',
    youtubeLink: '',
  })

  // Si editas, carga datos existentes...
  useEffect(() => {
    if (!isNew) {
      fetch(`/api/admin/posts/${id}`)
        .then(r => r.json())
        .then((post) => {
          setForm({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            tags: post.tags.join(','),
            status: post.status,
            coverImageUrl: post.coverImageUrl || '',
            youtubeLink: post.youtubeLink || '',
          })
        })
    }
  }, [id, isNew])

  // Maneja subida de la imagen a Cloudinary
  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const data = new FormData()
    data.append('file', file)
    data.append(
      'upload_preset',
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    )
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      }/image/upload`,
      {
        method: 'POST',
        body: data,
      }
    )
    const json = await res.json()
    // secure_url es la URL pública de Cloudinary
    setForm((f) => ({ ...f, coverImageUrl: json.secure_url }))
  }

  // Guardar (POST o PUT)
  async function save() {
    const payload = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      content: form.content,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      status: form.status,
      coverImageUrl: form.coverImageUrl,
      youtubeLink: form.youtubeLink,
    }
    const url    = isNew ? '/api/admin/posts' : `/api/admin/posts/${id}`
    const method = isNew ? 'POST'            : 'PUT'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) router.push('/admin/posts')
    else alert('Error saving post')
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        {isNew ? 'New Post' : 'Edit Post'}
      </h1>

      {/* Title */}
      <div>
        <Label>Title</Label>
        <Input
          value={form.title}
          onChange={(e) =>
            setForm((f) => ({ ...f, title: e.target.value }))
          }
        />
      </div>

      {/* Slug */}
      <div>
        <Label>Slug</Label>
        <Input
          value={form.slug}
          onChange={(e) =>
            setForm((f) => ({ ...f, slug: e.target.value }))
          }
        />
      </div>

      {/* Excerpt */}
      <div>
        <Label>Excerpt</Label>
        <Textarea
          value={form.excerpt}
          onChange={(e) =>
            setForm((f) => ({ ...f, excerpt: e.target.value }))
          }
        />
      </div>

      {/* Content */}
      <div>
        <Label>Content (Markdown)</Label>
        <Textarea
          value={form.content}
          onChange={(e) =>
            setForm((f) => ({ ...f, content: e.target.value }))
          }
          rows={10}
        />
      </div>

      {/* Tags */}
      <div>
        <Label>Tags (comma-separated)</Label>
        <Input
          value={form.tags}
          onChange={(e) =>
            setForm((f) => ({ ...f, tags: e.target.value }))
          }
        />
      </div>

      {/* Status */}
      <div>
        <Label>Status</Label>
        <select
          className="border rounded p-2"
          value={form.status}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              status: e.target.value as 'draft' | 'published',
            }))
          }
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      {/* YouTube Link */}
      <div>
        <Label>YouTube Video URL</Label>
        <Input
          placeholder="https://www.youtube.com/watch?v=..."
          value={form.youtubeLink}
          onChange={(e) =>
            setForm((f) => ({ ...f, youtubeLink: e.target.value }))
          }
        />
      </div>

      {/* Image Upload */}
      <div>
        <Label>Cover Image</Label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="mt-1"
        />
        {form.coverImageUrl && (
          <div className="mt-3">
            <Image
              src={form.coverImageUrl}
              alt="Cover preview"
              width={300}
              height={200}
              className="rounded shadow"
            />
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="text-right">
        <Button onClick={save}>
          {isNew ? 'Create Post' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
