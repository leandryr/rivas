// File: src/app/api/meetings/route.ts

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Meeting from '@/models/Meeting.model'
import AvailableSlot, { IAvailableSlot } from '@/models/AvailableSlot.model'
import { Types } from 'mongoose'

/**
 * GET /api/meetings?userId=...&projectId=...
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const url       = new URL(req.url)
    const projectId = url.searchParams.get('projectId')
    const userId    = url.searchParams.get('userId')
    const filter: Record<string, any> = {}

    if (projectId && Types.ObjectId.isValid(projectId)) {
      filter.projectId = new Types.ObjectId(projectId)
    }
    if (userId && Types.ObjectId.isValid(userId)) {
      filter.userId = new Types.ObjectId(userId)
    }

    const docs = await Meeting.find(filter)
      .populate({ path: 'projectId', select: 'title' })
      .sort({ date: 1 })
      .lean()

    const meetings = docs.map(m => ({
      _id:          m._id.toString(),
      projectId:    (m.projectId as any)._id.toString(),
      projectTitle: (m.projectId as any).title || '—',
      userId:       m.userId.toString(),
      date:         m.date.toISOString(),
      reason:       m.reason || '',
      status:       m.status,
      link:         m.link || '',
      createdAt:    m.createdAt.toISOString(),
      updatedAt:    m.updatedAt.toISOString(),
    }))

    return NextResponse.json(meetings, { status: 200 })
  } catch (err: any) {
    console.error('[API][GET] Error al listar reuniones:', err)
    return NextResponse.json({ error: 'Error al listar reuniones' }, { status: 500 })
  }
}

/**
 * POST /api/meetings
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const { projectId, userId, date, reason } = await req.json()

    // 1) Validaciones
    if (!projectId || !userId || !date) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 })
    }
    if (!Types.ObjectId.isValid(projectId) || !Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'IDs inválidos' }, { status: 400 })
    }

    const meetingDate = new Date(date)

    // 2) Chequeo de colisión exacta
    const exists = await Meeting.findOne({ date: meetingDate })
    if (exists) {
      return NextResponse.json({ error: 'Ya existe una reunión en ese horario' }, { status: 409 })
    }

    // 3) Crear reunión
    const newMeeting = await Meeting.create({
      projectId,
      userId,
      date:    meetingDate,
      reason:  reason || '',
      status:  'Pendiente',
      link:    '',
    })

    // 4) Quitar slot de disponibilidad
    const adminId = 'global'
    const dayKey  = meetingDate.toISOString().slice(0, 10)   // YYYY-MM-DD
    const hourKey = meetingDate.toISOString().substr(11, 5)  // HH:mm

    // 4a) Quitar la hora
    await AvailableSlot.updateOne(
      { adminId, 'availability.day': dayKey },
      { $pull: { 'availability.$.hours': hourKey } }
    )

    // 4b) Recuperar el doc y eliminar días sin horas
    const slotDoc = await AvailableSlot.findOne({ adminId })
    if (slotDoc) {
      // Filtrar en memoria
      slotDoc.availability = slotDoc.availability.filter(item => item.hours.length > 0)
      await slotDoc.save()
    }

    return NextResponse.json(
      { _id: (newMeeting._id as any).toString() },
      { status: 201 }
    )
  } catch (err: any) {
    console.error('[API][POST] Error al crear reunión:', err)
    return NextResponse.json({ error: 'Error al crear reunión' }, { status: 500 })
  }
}
