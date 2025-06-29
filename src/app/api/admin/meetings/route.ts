// File: src/app/api/meetings/route.ts

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Meeting from '@/models/Meeting.model'
import AvailableSlot from '@/models/AvailableSlot.model'
import { Types } from 'mongoose'

/**
 * GET /api/meetings?userId=...&projectId=...
 *
 * Recupera el listado de reuniones, filtradas opcionalmente por usuario
 * y/o proyecto, ordenadas cronológicamente. Cada reunión incluye además
 * el título del proyecto obtenido mediante populate.
 */
export async function GET(req: NextRequest) {
  try {
    // 1) Conectar a la base de datos
    await connectDB()

    // 2) Parsear parámetros de consulta
    const url       = new URL(req.url)
    const projectId = url.searchParams.get('projectId')
    const userId    = url.searchParams.get('userId')

    // 3) Construir filtro dinámico
    const filter: Record<string, any> = {}
    if (projectId && Types.ObjectId.isValid(projectId)) {
      filter.projectId = new Types.ObjectId(projectId)
    }
    if (userId && Types.ObjectId.isValid(userId)) {
      filter.userId = new Types.ObjectId(userId)
    }

    // 4) Consultar reuniones y poblar projectId con solo el campo 'title'
    const docs = await Meeting.find(filter)
      .populate({ path: 'projectId', select: 'title' })
      .sort({ date: 1 })   // Orden ascendente por fecha
      .lean()

    // 5) Mapear a formato plano para el cliente
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
    return NextResponse.json(
      { error: 'Error al listar reuniones' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/meetings
 *
 * Crea una nueva reunión y, automáticamente, elimina el slot reservado
 * de la configuración global de disponibilidad del admin.
 *
 * Body JSON:
 *   - projectId: string (ObjectId válido)
 *   - userId:    string (ObjectId válido)
 *   - date:      string (ISO 8601)
 *   - reason?:   string
 */
export async function POST(req: NextRequest) {
  try {
    // 1) Conectar a la base de datos
    await connectDB()

    // 2) Leer y validar body
    const body = await req.json()
    const { projectId, userId, date, reason } = body

    if (!projectId || !userId || !date) {
      return NextResponse.json(
        { error: 'Faltan datos obligatorios' },
        { status: 400 }
      )
    }
    if (
      !Types.ObjectId.isValid(projectId) ||
      !Types.ObjectId.isValid(userId)
    ) {
      return NextResponse.json(
        { error: 'IDs inválidos' },
        { status: 400 }
      )
    }

    // 3) Crear la nueva reunión
    const meetingDate = new Date(date)
    const newMeeting = await Meeting.create({
      projectId,
      userId,
      date:   meetingDate,
      reason: reason || '',
      status: 'Pendiente',
      link:   '',
    })

    // 4) Actualizar la disponibilidad global del admin:
    //    Eliminar el slot reservado de la fecha correspondiente
    const adminId = 'global'
    const dateKey  = meetingDate.toISOString().slice(0, 10)  // "YYYY-MM-DD"
    const hourKey  = meetingDate.toISOString().substr(11, 5) // "HH:mm"

    await AvailableSlot.updateOne(
      { adminId, 'availability.day': dateKey },
      { $pull: { 'availability.$.hours': hourKey } }
    )

    // 5) Responder con el ID de la reunión creada
    return NextResponse.json(
      { _id: (newMeeting._id as any).toString() },
      { status: 201 }
    )
  } catch (err: any) {
    console.error('[API][POST] Error al crear reunión:', err)
    return NextResponse.json(
      { error: 'Error al crear reunión' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/meetings
 *
 * Actualiza campos de una reunión existente. Body JSON:
 *   - meetingId: string (ObjectId válido)
 *   - date?:     string (ISO 8601)
 *   - reason?:   string
 *   - status?:   'Pendiente' | 'Confirmada' | 'Cancelada'
 *   - link?:     string (enlace de videollamada)
 */
export async function PATCH(req: NextRequest) {
  try {
    // 1) Conectar a la base de datos
    await connectDB()

    // 2) Leer y validar body
    const { meetingId, date, reason, status, link } = await req.json()
    if (!meetingId || !Types.ObjectId.isValid(meetingId)) {
      return NextResponse.json(
        { error: 'meetingId inválido' },
        { status: 400 }
      )
    }

    // 3) Construir objeto de actualización
    const updateFields: Record<string, any> = {}
    if (date) {
      updateFields.date = new Date(date)
    }
    if (typeof reason === 'string') {
      updateFields.reason = reason
    }
    if (
      status &&
      ['Pendiente', 'Confirmada', 'Cancelada'].includes(status)
    ) {
      updateFields.status = status
    }
    if (typeof link === 'string') {
      updateFields.link = link
    }

    // 4) Ejecutar el update
    const updated = await Meeting.findByIdAndUpdate(
      meetingId,
      { $set: updateFields },
      { new: true }
    ).lean()

    if (!updated) {
      return NextResponse.json(
        { error: 'Reunión no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200 }
    )
  } catch (err: any) {
    console.error('[API][PATCH] Error al actualizar reunión:', err)
    return NextResponse.json(
      { error: 'Error al actualizar reunión' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/meetings
 *
 * Elimina (o marca como cancelada) una reunión existente.
 * Body JSON:
 *   - meetingId: string (ObjectId válido)
 */
export async function DELETE(req: NextRequest) {
  try {
    // 1) Conectar a la base de datos
    await connectDB()

    // 2) Leer and validar meetingId
    const { meetingId } = await req.json()
    if (!meetingId || !Types.ObjectId.isValid(meetingId)) {
      return NextResponse.json(
        { error: 'meetingId inválido' },
        { status: 400 }
      )
    }

    // 3) Eliminar físicamente
    const removed = await Meeting.findByIdAndDelete(meetingId).lean()
    if (!removed) {
      return NextResponse.json(
        { error: 'Reunión no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    )
  } catch (err: any) {
    console.error('[API][DELETE] Error al eliminar reunión:', err)
    return NextResponse.json(
      { error: 'Error al eliminar reunión' },
      { status: 500 }
    )
  }
}
