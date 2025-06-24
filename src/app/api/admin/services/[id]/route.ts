import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Service, { IService } from '@/models/Service.model';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  await connectDB();

  if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const servicio: IService | null = await Service.findById(id).lean();
  if (!servicio) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  }

  return NextResponse.json(servicio);
}
