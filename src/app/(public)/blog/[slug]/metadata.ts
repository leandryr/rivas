// src/app/blog/[slug]/metadata.ts
import { Post } from '@/models/Post'
import connectDB from '@/lib/db'
import { Metadata } from 'next'

interface Props {
  params: { slug: string }
}

export default async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connectDB()
  const post = await Post.findOne({ slug: params.slug, status: 'published' }).lean()

  if (!post) {
    return {}
  }

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/blog/${post.slug}`

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      siteName: process.env.NEXT_PUBLIC_SITE_NAME,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    }
  }
}
