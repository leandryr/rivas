// File: src/app/api/admin/settings/availability/route.ts

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import AvailableSlot from '@/models/AvailableSlot.model'

/**
 * POST /api/admin/settings/availability
 * Recibe un objeto con keys de día (p. ej. "Lunes", "2025-06-24", etc.)
 * y arrays de horas ("HH:mm"), guarda o actualiza la disponibilidad.
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    // 1) Parsear body
    const body = await request.json()
    if (typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Formato inválido: se esperaba un objeto con keys de día y valores Array<string>' },
        { status: 400 }
      )
    }

    // 2) Transformar a array para el modelo
    const availability = Object.entries(body).map(([day, hours]) => ({
      day,
      hours: Array.isArray(hours)
        ? hours.filter(h => typeof h === 'string')
        : [],
    }))

    const adminId = 'global'

    // 3) Upsert: actualiza solo availability, mantiene adminId
    const doc = await AvailableSlot.findOneAndUpdate(
      { adminId },
      { $set: { availability } },
      { new: true, upsert: true }
    )

    return NextResponse.json({ success: true, data: doc }, { status: 200 })
  } catch (err: any) {
    console.error('[POST /admin/settings/availability]', err)
    return NextResponse.json(
      { error: 'Error interno al guardar disponibilidad' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/settings/availability
 * Devuelve la configuración de disponibilidad del admin global.
 */
export async function GET() {
  try {
    await connectDB()
    const adminId = 'global'

    // Busca el documento; si no existe, devuelve vacíos
    const doc = await AvailableSlot.findOne({ adminId }).lean()
    if (!doc) {
      return NextResponse.json(
        { success: true, data: { adminId, availability: [] } },
        { status: 200 }
      )
    }

    return NextResponse.json({ success: true, data: doc }, { status: 200 })
  } catch (err) {
    console.error('[GET /admin/settings/availability]', err)
    return NextResponse.json(
      { error: 'Error al cargar disponibilidad' },
      { status: 500 }
    )
  }
}
