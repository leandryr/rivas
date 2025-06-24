// src/app/api/admin/posts/[id]/route.ts
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Post } from '@/models/Post'
import { Subscriber } from '@/models/Subscriber'
import { sendNewPostEmail } from '@/lib/mailer'
import { Types } from 'mongoose'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth'

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB()
  const { id } = await context.params

  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  const post = await Post.findById(id)
  if (!post) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(post)
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB()
  const { id } = await context.params

  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  const body = await request.json()
  const {
    title,
    slug,
    excerpt,
    content,
    coverImageUrl,
    youtubeLink,
    tags,
    status,
  } = body

  const updated = await Post.findByIdAndUpdate(
    id,
    {
      title,
      slug,
      excerpt,
      content,
      coverImageUrl,
      youtubeLink,
      tags,
      status,
      ...(status === 'published' && { publishedAt: new Date() }),
    },
    { new: true }
  )

  if (!updated) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  if (status === 'published') {
    const subs = await Subscriber.find().lean()
    subs.forEach((s) =>
      sendNewPostEmail(s.email, {
        title: updated.title,
        slug: updated.slug,
      }).catch(console.error)
    )
  }

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB()
  const { id } = await context.params

  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  await Post.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}
