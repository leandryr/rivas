import connectDB from '@/lib/db'
import { NextResponse } from 'next/server'
import Meeting from '@/models/Meeting'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await connectDB()
  const { id } = params
  const body = await req.json()

  const { status, meetLink, responseNote } = body

  if (!['confirmed', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
  }

  const updated = await Meeting.findByIdAndUpdate(id, {
    status,
    ...(meetLink && { meetLink }),
    ...(responseNote && { responseNote })
  }, { new: true })

  if (!updated) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  return NextResponse.json({ meeting: updated })
}
