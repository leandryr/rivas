import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phone, isPhoneVerified, isEmailVerified } = await req.json();

    if (!isPhoneVerified || !isEmailVerified) {
      return NextResponse.json({ error: 'Both verifications required.' }, { status: 400 });
    }

    await dbConnect();

    const updated = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        phone: phone?.trim(),
        isPhoneVerified: true,
        isEmailVerified: true,
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: updated });
  } catch (err) {
    console.error('Verification update error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
