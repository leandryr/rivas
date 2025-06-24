// src/app/(public)/blog/[slug]/page.tsx
import React from 'react'
import Head from 'next/head'
import { headers } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

import connectDB from '@/lib/db'
import { Post } from '@/models/Post'
import User from '@/models/User'
import ShareButtons from '@/components/ShareButtons'
import CommentsSection from '@/components/CommentsSection'
import SubscribeForm from '@/components/SubscribeForm'
import NavbarClient from '@/app/(public)/landing/NavbarClient'
import { getLandingConfig } from '@/lib/getLandingConfig'
import type { ILandingConfig } from '@/models/LandingConfig.model'

export const dynamic = 'force-dynamic'

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  // 1. Resolvemos params
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)

  // 2. Conexión a BD y config
  await connectDB()
  const config = (await getLandingConfig()) as ILandingConfig

  // 3. Cargamos el post publicado
  const post = await Post.findOne({
    slug: decodedSlug,
    status: 'published',
  }).lean()
  if (!post) {
    return (
      <>
        <NavbarClient
          logoUrl={config.logoUrl}
          primaryColor={config.primaryColor}
        />
        <p className="pt-28 p-6 text-center">Not found.</p>
      </>
    )
  }

  // 4. Datos de autor
  const author = post.author
    ? await User.findById(post.author).lean()
    : null

  // 5. Recomendaciones: últimos 3 posts
  const recommendations = await Post.find({
    status: 'published',
    _id: { $ne: post._id },
  })
    .sort({ publishedAt: -1 })
    .limit(3)
    .lean()

  // 6. Construcción de URL para compartir
  const hdrs = await headers()
  const host = hdrs.get('x-forwarded-host') || hdrs.get('host') || ''
  const shareUrl = `https://${host}/blog/${post.slug}`

  // 7. Datos SEO / OpenGraph / Twitter
  const title = post.title
  const description = post.excerpt || ''
  const image = post.coverImageUrl || ''

  return (
    <>
      {/* SEO y Open Graph */}
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />

        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={shareUrl} />
        {image && <meta property="og:image" content={image} />}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {image && <meta name="twitter:image" content={image} />}
      </Head>

      {/* Navbar */}
      <NavbarClient
        logoUrl={config.logoUrl}
        primaryColor={config.primaryColor}
      />

      <div className="max-w-6xl mx-auto px-4 py-12 pt-28 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Contenido principal */}
        <article className="lg:col-span-3 space-y-8">
          {/* Autor */}
          {author && (
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 relative rounded-full overflow-hidden shadow">
                <Image
                  src={author.avatar || '/default-avatar.png'}
                  alt={`${author.name} ${author.lastname}`}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {author.name} {author.lastname}
                </p>
                <p className="text-sm text-gray-500">{author.bio}</p>
              </div>
            </div>
          )}

          {/* Fechas */}
          <div className="text-sm text-gray-500 space-y-1">
            <time
              className="block"
              dateTime={new Date(post.createdAt!).toISOString()}
            >
              <strong>Creado:</strong>{' '}
              {new Date(post.createdAt!).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            <time
              className="block"
              dateTime={new Date(post.updatedAt!).toISOString()}
            >
              <strong>Última actualización:</strong>{' '}
              {new Date(post.updatedAt!).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </div>

          {/* Título y descripción */}
          <h1 className="text-4xl font-bold leading-tight">{title}</h1>
          {description && (
            <p className="text-xl text-gray-600">{description}</p>
          )}

          {/* Botones de compartir */}
          <ShareButtons url={shareUrl} title={title} />

          {/* Imagen destacada */}
          {image && (
            <div className="w-full h-80 relative rounded overflow-hidden shadow">
              <Image
                src={image}
                alt={title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Vídeo */}
          {post.youtubeLink && (
            <div
              className="relative w-full"
              style={{ paddingTop: '56.25%' }}
            >
              <iframe
                src={post.youtubeLink.replace(
                  'watch?v=',
                  'embed/'
                )}
                title="YouTube video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full rounded-lg shadow"
              />
            </div>
          )}

          {/* Contenido Markdown */}
          <div className="prose prose-lg prose-gray dark:prose-invert max-w-none">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          {/* Comentarios */}
          <CommentsSection postId={post._id.toString()} />

          {/* — Lecturas recomendadas — */}
          <section className="pt-8 border-t">
            <h2 className="text-2xl font-semibold mb-4">Read next</h2>
            <ul className="space-y-4">
              {recommendations.map((r) => (
                <li
                  key={r._id.toString()}
                  className="flex items-start space-x-4"
                >
                  {r.coverImageUrl && (
                    <div className="w-16 h-16 relative flex-shrink-0 overflow-hidden rounded">
                      <Image
                        src={r.coverImageUrl}
                        alt={r.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <Link
                      href={`/blog/${r.slug}`}
                      className="font-medium hover:underline"
                    >
                      {r.title}
                    </Link>
                    <p className="text-sm text-gray-600">{r.excerpt}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Newsletter interno */}
          <section className="pt-8 border-t text-center">
            <h2 className="text-2xl font-semibold mb-2">
              Sign up for our newsletter
            </h2>
            <p className="text-gray-600 mb-4">
              Stay up to date with announcements and exclusive content.
            </p>
            <SubscribeForm />
          </section>
        </article>

        {/* Barra lateral */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6">
          {/* Suscripción en sidebar */}
          <div className="border rounded p-4 bg-white">
            <h3 className="font-semibold mb-2">Morning Headlines</h3>
            <p className="text-sm text-gray-600 mb-2">
              Get news delivered to your inbox every morning.
            </p>
            <SubscribeForm />
          </div>

          {/* Latest News */}
          <div className="border rounded p-4 bg-white">
            <h3 className="font-semibold mb-3">Latest News</h3>
            <ul className="space-y-3 text-sm">
              {recommendations.map((r) => (
                <li key={r._id.toString()}>
                  <Link
                    href={`/blog/${r.slug}`}
                    className="hover:underline font-medium"
                  >
                    {r.title}
                  </Link>
                  <div className="text-gray-500">
                    {new Date(
                      r.publishedAt ?? r.createdAt!
                    ).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  )
}
