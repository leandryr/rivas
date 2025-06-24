import connectDB from '@/lib/db'
import { auth } from '@/auth'
import Project from '@/models/Project'
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
