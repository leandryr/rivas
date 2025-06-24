// src/app/api/admin/posts/route.ts
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Post } from '@/models/Post'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth'

export async function GET() {
  await connectDB()
  // Sólo administradores pueden listar todos los posts
  const posts = await Post.find().sort({ createdAt: -1 })
  return NextResponse.json(posts)
}

export async function POST(request: Request) {
  await connectDB()
  // Verificamos sesión y rol
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Extraemos los campos esperados del body
  const {
    title,
    slug,
    excerpt,
    content,
    coverImageUrl,  // URL de la imagen subida (Cloudinary)
    youtubeLink,    // URL del vídeo de YouTube
    tags,
    status,
  } = await request.json()

  // Creamos el post incluyendo los nuevos campos
  const post = await Post.create({
    title,
    slug,
    excerpt,
    content,
    coverImageUrl,
    youtubeLink,
    tags,
    status,
    author: session.user.id,  // Mongo _id del admin
  })

  return NextResponse.json(post, { status: 201 })
}
