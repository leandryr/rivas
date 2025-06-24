// src/app/(public)/blog/page.tsx
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { headers } from 'next/headers'
import { parse } from 'url'
import connectDB from '@/lib/db'
import { Post } from '@/models/Post'
import { Types } from 'mongoose'
import NavbarClient from './NavbarClient'
import { getLandingConfig } from '@/lib/getLandingConfig'
import type { ILandingConfig } from '@/models/LandingConfig.model'

// 🧠 Interface interna para resumen de post
interface PostSummary {
  _id: Types.ObjectId
  title: string
  slug: string
  excerpt: string
  coverImageUrl?: string
  publishedAt?: Date
}

export default async function BlogPage() {
  // 🔍 Obtener parámetros desde headers
  const headersList = await headers()
  const url = headersList.get('x-url') || '/'
  const { query } = parse(url, true)
  const pageRaw = Array.isArray(query.page) ? query.page[0] : query.page || '1'
  const qRaw = Array.isArray(query.q) ? query.q[0] : query.q || ''
  const pageNum = Math.max(parseInt(pageRaw, 10), 1)
  const queryText = qRaw.trim()

  // 🛠️ DB + Config (sigue usándose para el Navbar)
  await connectDB()
  const config = (await getLandingConfig()) as ILandingConfig

  // 🔎 Filtros y consulta
  const PAGE_SIZE = 7
  const filter: Record<string, any> = { status: 'published' }
  if (queryText) filter.$text = { $search: queryText }

  const raw = (await Post.find(filter)
    .sort({ publishedAt: -1 })
    .skip((pageNum - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE + 1)
    .select('title slug excerpt coverImageUrl publishedAt')
    .lean()) as unknown as PostSummary[]

  const hasMore = raw.length > PAGE_SIZE
  const posts = hasMore ? raw.slice(0, PAGE_SIZE) : raw

  // — Si no hay posts en la primera página
  if (posts.length === 0 && pageNum === 1) {
    return (
      <>
        <NavbarClient logoUrl={config.logoUrl} primaryColor={config.primaryColor} />
        <p className="p-6 text-center pt-28">No hay artículos publicados.</p>
      </>
    )
  }

  const [featured, ...others] = posts

  return (
    <>
      <NavbarClient logoUrl={config.logoUrl} primaryColor={config.primaryColor} />

      <div className="max-w-6xl mx-auto px-4 py-12 pt-28 space-y-8">
        {/* 🔝 Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Our Blog</h1>
          <p className="text-gray-600">
            We use an agile approach to test assumptions and connect with your audience early and often.
          </p>
          <form method="get" className="mt-4 flex justify-center">
            <input
              name="q"
              defaultValue={queryText}
              placeholder="Search posts..."
              className="border rounded-l px-3 py-2 w-64 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 rounded-r hover:bg-blue-700"
            >
              Search
            </button>
          </form>
        </div>

        {/* 📰 Post destacado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featured && (
            <Link href={`/blog/${featured.slug}`} className="group block">
              <div className="overflow-hidden rounded-lg shadow-lg">
                {featured.coverImageUrl && (
                  <div className="relative h-56 w-full group-hover:scale-105 transition-transform">
                    <Image
                      src={featured.coverImageUrl}
                      alt={featured.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6 bg-white dark:bg-gray-800">
                  <h2 className="text-2xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                    {featured.title}
                  </h2>
                  <p className="text-gray-600 mb-4">{featured.excerpt}</p>
                  <span className="text-sm text-blue-500 font-medium">Read more →</span>
                </div>
              </div>
            </Link>
          )}

          {/* 📚 Otros posts */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {others.map(post => (
              <Link
                key={post._id.toString()}
                href={`/blog/${post.slug}`}
                className="block group"
              >
                <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-3">{post.excerpt}</p>
                  <span className="text-sm text-blue-500 font-medium">Read more →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ⏩ Paginación */}
        <nav className="flex justify-between items-center">
          {pageNum > 1 ? (
            <Link
              href={`/blog?page=${pageNum - 1}${queryText ? `&q=${encodeURIComponent(queryText)}` : ''}`}
              className="text-blue-600 hover:underline"
            >
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          {hasMore ? (
            <Link
              href={`/blog?page=${pageNum + 1}${queryText ? `&q=${encodeURIComponent(queryText)}` : ''}`}
              className="text-blue-600 hover:underline"
            >
              Next →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </>
  )
}
