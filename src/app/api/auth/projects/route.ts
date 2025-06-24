// src/app/api/projects/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Project from '@/models/Project.model';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Falta userId' }, { status: 400 });
  }

  await connectDB();
  const proyectos = await Project.find({ ownerId: userId }).select('title').lean();

  // Transformamos ObjectId a string y devolvemos solo { _id, title }
  const formatted = proyectos.map((p) => ({
    _id: p._id.toString(),
    title: p.title,
  }));

  return NextResponse.json(formatted);
}
