// src/app/api/auth/clients/projects/route.ts

import connectDB from '@/lib/db'
import { auth } from '@/lib/a/auth'
import Project from '@/models/Project.model'
import { NextResponse } from 'next/server'

export async function GET() {
  await connectDB()

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const activeStatuses = ['requested', 'in progress', 'review']
  const projects = await Project.find({
    client: session.user.id,
    status: { $in: activeStatuses }
  })

  return NextResponse.json({ projects })
}
