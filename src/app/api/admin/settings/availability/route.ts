import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import AvailableSlot from '@/models/AvailableSlot.model';

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    if (typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Formato inválido' }, { status: 400 });
    }

    const availability = Object.entries(body).map(([day, hours]) => ({
      day,
      hours: Array.isArray(hours) ? hours : [],
    }));

    const adminId = 'global';

    const updated = await AvailableSlot.findOneAndUpdate(
      { adminId },
      { adminId, availability },
      { new: true, upsert: true, strict: false } // <-- Fix para permitir adminId si no está en schema
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error('[POST /admin/settings/availability]', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const adminId = 'global';
    const data = await AvailableSlot.findOne({ adminId });
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('[GET /admin/settings/availability]', err);
    return NextResponse.json({ error: 'Error al cargar disponibilidad' }, { status: 500 });
  }
}
