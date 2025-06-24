// src/app/api/meetings/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Meeting from '@/models/Meeting.model';
import { Types } from 'mongoose';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // “Await” sobre context.params para obtener el objeto real con id
    const { id } = await context.params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'ID de reunión inválido' },
        { status: 400 }
      );
    }

    const meeting = await Meeting.findById(id);
    if (!meeting) {
      return NextResponse.json(
        { error: 'Reunión no encontrada' },
        { status: 404 }
      );
    }

    const data = await req.json();
    const { status, link } = data as { status?: string; link?: string };

    // Validar estado
    const validStatuses = ['Pendiente', 'Confirmada', 'Cancelada'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Estado inválido' },
        { status: 400 }
      );
    }

    // Si cambian a “Confirmada” sin enviar link, error
    if (status === 'Confirmada' && (!link || link.trim() === '')) {
      return NextResponse.json(
        { error: 'Debes proporcionar un enlace al confirmar' },
        { status: 400 }
      );
    }

    // Actualizar campos según estado
    if (status) {
      meeting.status = status as any;
    }
    if (status === 'Confirmada') {
      meeting.link = link!.trim();
    }
    if (status === 'Pendiente' || status === 'Cancelada') {
      meeting.link = '';
    }

    await meeting.save();
    return NextResponse.json({ message: 'Reunión actualizada' });
  } catch (error: any) {
    console.error('[PATCH] Error al actualizar reunión:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la reunión' },
      { status: 500 }
    );
  }
}
