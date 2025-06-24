import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Quote } from '@/models/Quote';

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const quote = await Quote.findById(params.id);
  if (!quote) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (quote.status !== 'accepted') {
    return NextResponse.json({ error: 'Only accepted quotes can be converted' }, { status: 400 });
  }
  quote.status = 'paid';
  await quote.save();
  await quote.populate('client', 'name email');
  return NextResponse.json(quote);
}
