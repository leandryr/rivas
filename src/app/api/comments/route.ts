// src/app/api/comments/route.ts
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Comment } from '@/models/Comment'
import { Types } from 'mongoose'

// forma tras lean()
type LeanComment = {
  _id: Types.ObjectId
  authorName: string
  text: string
  createdAt: Date
}

export async function GET(req: Request) {
  await connectDB()
  const url = new URL(req.url)
  const postId = url.searchParams.get('postId')
  if (!postId || !Types.ObjectId.isValid(postId)) {
    return NextResponse.json({ error: 'Invalid postId' }, { status: 400 })
  }

  const comments = await Comment
    .find({ post: postId })
    .sort({ createdAt: 1 })
    .lean<LeanComment[]>()

  const result = comments.map(c => ({
    _id:       c._id.toString(),
    author:   { name: c.authorName, image: null },
    text:      c.text,
    createdAt: c.createdAt.toISOString(),
  }))

  return NextResponse.json(result)
}

export async function POST(req: Request) {
  await connectDB()

  const { postId, name, text } = (await req.json()) as {
    postId?: string
    name?: string
    text?: string
  }

  if (
    !postId ||
    !Types.ObjectId.isValid(postId) ||
    !name?.trim() ||
    !text?.trim()
  ) {
    return NextResponse.json(
      { error: 'postId, name and non-empty text required' },
      { status: 400 }
    )
  }

  // spam-control: max 5 comentarios en 10min por mismo name
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000)
  const recentCount = await Comment.countDocuments({
    authorName: name.trim(),
    createdAt:   { $gte: tenMinAgo },
  })
  if (recentCount >= 5) {
    return NextResponse.json(
      { error: 'Too many comments; please wait 10 minutes.' },
      { status: 429 }
    )
  }

  const commentDoc = await Comment.create({
    post:       postId,
    authorName: name.trim(),
    text:       text.trim(),
  })

  return NextResponse.json({
    _id:       commentDoc._id.toString(),
    author:   { name: commentDoc.authorName, image: null },
    text:      commentDoc.text,
    createdAt: commentDoc.createdAt.toISOString(),
  })
}
