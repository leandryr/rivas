import connectDB from '@/lib/db'
import { NextResponse } from 'next/server'
import Meeting from '@/models/Meeting'
import User from '@/models/User'
import Project from '@/models/Project'

export async function GET() {
  await connectDB()

  const meetings = await Meeting.find()
    .populate({ path: 'client', select: 'name email' })
    .populate({ path: 'project', select: 'title' })
    .sort({ date: 1 })

  const formatted = meetings.map(m => ({
    _id: m._id,
    clientName: m.client?.name || '—',
    projectTitle: m.project?.title || '—',
    date: m.date,
    status: m.status,
    reason: m.reason,
    responseNote: m.responseNote,
    meetLink: m.meetLink,
  }))

  return NextResponse.json({ meetings: formatted })
}
