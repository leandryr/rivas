// src/app/api/meetings/route.ts

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Meeting from '@/models/Meeting.model';
import { Types } from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const projectId = url.searchParams.get('projectId');
    const userId = url.searchParams.get('userId');

    // 1) Construimos el filtro dinámicamente
    const filter: any = {};
    if (projectId && Types.ObjectId.isValid(projectId)) {
      filter.projectId = new Types.ObjectId(projectId);
    }
    if (userId && Types.ObjectId.isValid(userId)) {
      filter.userId = new Types.ObjectId(userId);
    }

    // 2) Hacemos find() y poblamos projectId solamente con el campo 'title'
    const docs = await Meeting.find(filter)
      .populate({ path: 'projectId', select: 'title' })
      .sort({ date: 1 }) // orden cronológico ascendente
      .lean();

    // 3) Convertimos a formato plano para el cliente (incluyendo projectTitle y link)
    const meetings = docs.map((m) => ({
      _id: m._id.toString(),
      projectId: (m.projectId as any)._id.toString(),
      projectTitle: (m.projectId as any).title || '—',
      userId: m.userId.toString(),
      date: m.date.toISOString(),
      reason: m.reason || '',
      status: m.status,
      link: m.link || '',
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    }));

    return NextResponse.json(meetings, { status: 200 });
  } catch (error: any) {
    console.error('[API][GET] Error al listar reuniones:', error);
    return NextResponse.json({ error: 'Error al listar reuniones' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { projectId, userId, date, reason } = body;

    // Validaciones mínimas
    if (!projectId || !userId || !date) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
    }
    if (!Types.ObjectId.isValid(projectId) || !Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'IDs inválidos' }, { status: 400 });
    }

    // Creamos la nueva reunión (link por defecto vacío)
    const newMeeting = await Meeting.create({
      projectId,
      userId,
      date: new Date(date),
      reason: reason || '',
      status: 'Pendiente',
      link: '', // Aseguramos que el campo exista
    });

    // → Aquí forzamos a TS a interpretar newMeeting._id como ObjectId:
    const newId = (newMeeting._id as any).toString();

    return NextResponse.json({ _id: newId }, { status: 201 });
  } catch (error: any) {
    console.error('[API][POST] Error al crear reunión:', error);
    return NextResponse.json({ error: 'Error al crear reunión' }, { status: 500 });
  }
}
