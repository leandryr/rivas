// src/app/api/tasks/route.ts

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Task from '@/models/Task.model';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json(
      { error: 'Falta projectId en la query string' },
      { status: 400 }
    );
  }

  await connectDB();

  try {
    const tareas = await Task.find({ projectId })
      .select('title description status createdAt updatedAt')
      .lean();

    const resultado = tareas.map((t) => ({
      _id: t._id.toString(),
      title: t.title,
      description: t.description,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }));

    return NextResponse.json(resultado);
  } catch (err) {
    console.error('[GET /api/tasks] Error al buscar tareas:', err);
    return NextResponse.json(
      { error: 'Error al buscar tareas' },
      { status: 500 }
    );
  }
}
