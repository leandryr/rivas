// src/app/actions/meetingClientActions.ts
'use server';

import connectDB from '@/lib/db';
import Meeting from '@/models/Meeting.model';
import { revalidatePath } from 'next/cache';

export async function createMeetingAction(formData: FormData) {
  await connectDB();
  const projectId = formData.get('projectId')?.toString() || '';
  const userId = formData.get('userId')?.toString() || '';
  const dateStr = formData.get('date')?.toString() || '';
  const reason = formData.get('reason')?.toString() || '';

  if (!projectId || !userId || !dateStr) {
    throw new Error('Faltan datos obligatorios');
  }

  await Meeting.create({
    projectId,
    userId,
    date: new Date(dateStr),
    reason,
    status: 'Pendiente',
  });

  // Revalida la página de Cliente → Reuniones
  revalidatePath('/(dashboard)/client/meetings');
}

export async function updateMeetingAction(formData: FormData) {
  await connectDB();
  const meetingId = formData.get('meetingId')?.toString() || '';
  const dateStr = formData.get('date')?.toString();
  const reason = formData.get('reason')?.toString();
  const status = formData.get('status')?.toString();

  if (!meetingId) {
    throw new Error('ID de reunión faltante');
  }
  const update: any = {};
  if (dateStr) update.date = new Date(dateStr);
  if (reason !== undefined) update.reason = reason;
  if (status) {
    const valid = ['Pendiente', 'Confirmada', 'Cancelada'];
    if (!valid.includes(status)) throw new Error('Estado inválido');
    update.status = status;
  }

  await Meeting.findByIdAndUpdate(meetingId, update);

  // Revalida la página de Cliente → Reuniones
  revalidatePath('/(dashboard)/client/meetings');
}

export async function cancelMeetingAction(formData: FormData) {
  await connectDB();
  const meetingId = formData.get('meetingId')?.toString() || '';
  if (!meetingId) {
    throw new Error('ID de reunión faltante');
  }
  await Meeting.findByIdAndUpdate(meetingId, { status: 'Cancelada' });
  revalidatePath('/(dashboard)/client/meetings');
}
