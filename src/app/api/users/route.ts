import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();

    const users = await User.find({ role: 'client' }).select(`
      name lastname email role provider phone 
      isEmailVerified isPhoneVerified hasValidPaymentMethod stripeCustomerId 
      paymentMethodDetails avatar createdAt
      agencyName subdomain company bio language otherLanguages
      services category location teamSize currency settings notifications
    `).sort({ createdAt: -1 }).lean();

    return NextResponse.json(users);
  } catch (error) {
    console.error('[API USERS GET]', error);
    return NextResponse.json({ message: 'Error al obtener usuarios' }, { status: 500 });
  }
}