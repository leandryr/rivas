'use server';

import connectDB from '@/lib/db';
import Service from '@/models/Service.model';
import { revalidatePath } from 'next/cache';

interface DeleteParams {
  params: { id: string };
}

export async function POST(
  req: Request,
  { params }: DeleteParams
) {
  const { id } = params;
  await connectDB();

  // Validar ID
  if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
    return new Response('ID inválido', { status: 400 });
  }

  const servicio = await Service.findById(id);
  if (!servicio) {
    return new Response('Servicio no encontrado', { status: 404 });
  }

  await Service.deleteOne({ _id: servicio._id });
  revalidatePath('/admin/services');

  return new Response('Servicio eliminado', { status: 200 });
}
