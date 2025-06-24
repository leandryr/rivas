// src/app/api/admin/meetings/route.ts

import connectDB from '@/lib/db'
import { NextResponse } from 'next/server'
import Meeting from '@/models/Meeting.model'
import User    from '@/models/User'
import Project from '@/models/Project.model'

export async function GET() {
  await connectDB()

  // 1) Buscamos reuniones y poblamos por userId y projectId
  const meetings = await Meeting.find()
    .populate({ path: 'userId',    select: 'name email',   model: User })
    .populate({ path: 'projectId', select: 'title',       model: Project })
    .sort({ date: 1 })

  // 2) Formateamos respuesta según tu esquema
  const formatted = meetings.map(m => ({
    _id:           m._id,
    clientName:    (m.userId   as any)?.name   ?? '—',
    clientEmail:   (m.userId   as any)?.email  ?? '—',
    projectTitle:  (m.projectId as any)?.title ?? '—',
    date:          m.date,
    status:        m.status,
    reason:        m.reason   ?? '—',
    link:          m.link     ?? '—',
  }))

  return NextResponse.json({ meetings: formatted })
}
