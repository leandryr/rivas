// src/app/api/admin/quotes/[id]/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Quote } from '@/models/Quote';

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();

  // 🚩 await params antes de usarlo
  const { id } = await context.params;

  try {
    const quote = await Quote.findById(id).populate('client', 'name email');
    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(quote);
  } catch (err: any) {
    console.error('[GET QUOTE ERROR]', err);
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}
