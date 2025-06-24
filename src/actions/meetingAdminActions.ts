// src/app/actions/meetingAdminActions.ts
'use server';

import connectDB from '@/lib/db';
import Meeting from '@/models/Meeting.model';
import { revalidatePath } from 'next/cache';

export interface MeetingAdminDTO {
  _id: string;
  user: { _id: string; name: string; email: string };
  project: { _id: string; title: string };
  date: string;
  reason?: string;
  status: 'Pendiente' | 'Confirmada' | 'Cancelada';
  link: string;
  createdAt: string;
  updatedAt: string;
}

export async function getAllMeetingsForAdmin(): Promise<MeetingAdminDTO[]> {
  await connectDB();

  // 1) Buscamos todas las reuniones, poblamos userId (solo name/email) y projectId (solo title)
  const docs = await Meeting.find()
    .populate({ path: 'userId', select: 'name email' })
    .populate({ path: 'projectId', select: 'title' })
    .sort({ date: 1 })
    .lean<any>(); // aquí indicamos que .lean() devuelve “any[]”

  // 2) Mapeamos cada documento a un MeetingAdminDTO
  return docs.map((m: any) => ({
    _id: m._id.toString(),
    user: {
      _id: (m.userId as any)?._id.toString(),
      name: (m.userId as any)?.name || '–',
      email: (m.userId as any)?.email || '–',
    },
    project: {
      _id: (m.projectId as any)?._id.toString(),
      title: (m.projectId as any)?.title || '–',
    },
    date: m.date.toISOString(),
    reason: m.reason || '',
    status: m.status,
    link: m.link || '',                // <— campo “link”
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  }));
}

export async function updateMeetingStatusAdminAction(formData: FormData) {
  await connectDB();

  const meetingId = formData.get('meetingId')?.toString() || '';
  const status    = formData.get('status')?.toString() || '';
  const valid     = ['Pendiente', 'Confirmada', 'Cancelada'];

  if (!meetingId || !valid.includes(status)) {
    throw new Error('Faltan datos o estado inválido');
  }

  await Meeting.findByIdAndUpdate(meetingId, { status });
  revalidatePath('/(dashboard)/admin/meetings');
}
