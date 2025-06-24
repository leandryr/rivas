import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db'
import Meeting from '@/models/Meeting.model'
import Project from '@/models/Project'
import User from '@/models/User'

export async function POST(req: Request) {
  await connectDB()

  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const user = await User.findOne({ email: session.user.email }).select('_id')
  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
  }

  const { projectId, date, reason } = await req.json()
  if (!projectId || !date) {
    return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 })
  }

  const project = await Project.findOne({
    _id: projectId,
    client: user._id,
    status: { $in: ['in progress', 'review', 'completed'] },
  })

  if (!project) {
    return NextResponse.json({ error: 'Proyecto inválido' }, { status: 403 })
  }

  const meeting = await Meeting.create({
    client: user._id,
    project: projectId,
    date,
    reason,
  })

  return NextResponse.json({ success: true, meeting })
}
