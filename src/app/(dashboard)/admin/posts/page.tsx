// src/app/admin/posts/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface PostSummary {
  _id: string
  title: string
  status: 'draft' | 'published'
  updatedAt: string
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<PostSummary[]>([])
  const router = useRouter()

  useEffect(() => {
    fetch('/api/admin/posts')
      .then(r => r.json())
      .then(setPosts)
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Posts</h1>
        <Button onClick={() => router.push('/admin/posts/new')}>
          New Post
        </Button>
      </div>
      <div className="overflow-auto border rounded shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Updated</th>
              <th className="px-4 py-2">Edit</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {posts.map(p => (
              <tr key={p._id}>
                <td className="px-4 py-2">{p.title}</td>
                <td className="px-4 py-2 capitalize">{p.status}</td>
                <td className="px-4 py-2">
                  {new Date(p.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/admin/posts/${p._id}`)}
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
