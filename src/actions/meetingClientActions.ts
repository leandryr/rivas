// File: src/app/actions/meetingClientActions.ts
'use server'

import connectDB from '@/lib/db'
import Meeting from '@/models/Meeting.model'
import AvailableSlot from '@/models/AvailableSlot.model'
import { revalidatePath } from 'next/cache'

/**
 * Crea una nueva reunión y actualiza la disponibilidad.
 * Lanza un error si ya existe una reunión en el mismo horario.
 * Revalida la página de reuniones del cliente al finalizar.
 * @returns El ID de la nueva reunión como string
 */
export async function createMeetingAction(formData: FormData): Promise<string> {
  // 1) Conectar a BD
  await connectDB()

  // 2) Extraer campos
  const projectId = formData.get('projectId')?.toString() || ''
  const userId    = formData.get('userId')?.toString()    || ''
  const dateStr   = formData.get('date')?.toString()      || ''
  const reason    = formData.get('reason')?.toString()    || ''

  // 3) Validar datos obligatorios
  if (!projectId || !userId || !dateStr) {
    throw new Error('Faltan datos obligatorios')
  }

  // 4) Parsear fecha y validar que no exista ya una reunión en ese instante
  const dt = new Date(dateStr)
  const existing = await Meeting.findOne({ date: dt })
  if (existing) {
    throw new Error('Ya existe una reunión en ese horario')
  }

  // 5) Crear la reunión
  const newMeeting = await Meeting.create({
    projectId,
    userId,
    date:   dt,
    reason,
    status: 'Pendiente',
    link:   '',
  })

  // 6) Quitar el slot reservado de la disponibilidad global del admin
  const adminId = 'global'
  const dayKey  = dt.toISOString().slice(0, 10)   // "YYYY-MM-DD"
  const hourKey = dt.toISOString().substr(11, 5)  // "HH:mm"

  // 6a) eliminar la hora del día correspondiente
  await AvailableSlot.updateOne(
    { adminId, 'availability.day': dayKey },
    { $pull: { 'availability.$.hours': hourKey } }
  )

  // 6b) eliminar cualquier día que ya no tenga horas disponibles
  await AvailableSlot.updateOne(
    { adminId },
    { $pull: { availability: { hours: [] } } }
  )

  // 7) Forzar revalidación de la página de reuniones del cliente
  revalidatePath('/(dashboard)/client/meetings')

  // 8) Devolver el nuevo ID correctamente casteado
  return (newMeeting._id as any).toString()
}

/**
 * Actualiza una reunión existente. Valida choques de horario al cambiar fecha.
 * Revalida la página de reuniones del cliente al finalizar.
 */
export async function updateMeetingAction(formData: FormData): Promise<void> {
  await connectDB()

  const meetingId = formData.get('meetingId')?.toString() || ''
  const dateStr   = formData.get('date')?.toString()     || ''
  const reason    = formData.get('reason')?.toString()
  const status    = formData.get('status')?.toString()

  if (!meetingId) {
    throw new Error('ID de reunión faltante')
  }

  const update: any = {}

  // Si cambia la fecha, comprobamos que no choque con otra reunión
  if (dateStr) {
    const newDate = new Date(dateStr)
    const clash = await Meeting.findOne({
      date: newDate,
      _id:  { $ne: meetingId },
    })
    if (clash) {
      throw new Error('Ya existe otra reunión en ese horario')
    }
    update.date = newDate
  }

  if (reason !== undefined) {
    update.reason = reason
  }

  if (status) {
    const valid = ['Pendiente', 'Confirmada', 'Cancelada']
    if (!valid.includes(status)) {
      throw new Error('Estado inválido')
    }
    update.status = status
  }

  await Meeting.findByIdAndUpdate(meetingId, update)

  revalidatePath('/(dashboard)/client/meetings')
}

/**
 * Marca como cancelada una reunión existente.
 * Revalida la página de reuniones del cliente al finalizar.
 */
export async function cancelMeetingAction(formData: FormData): Promise<void> {
  await connectDB()

  const meetingId = formData.get('meetingId')?.toString() || ''
  if (!meetingId) {
    throw new Error('ID de reunión faltante')
  }

  await Meeting.findByIdAndUpdate(meetingId, { status: 'Cancelada' })

  revalidatePath('/(dashboard)/client/meetings')
}
