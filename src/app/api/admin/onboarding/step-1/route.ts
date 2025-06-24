import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  console.log('📥 Incoming request to onboarding step-1');

  await connectDB();

  const session = await getServerSession(authOptions);

  console.log('📡 Session:', session);

  if (!session || !session.user?.email) {
    console.warn('❌ Unauthorized access attempt');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  console.log('📦 Request body:', body);

  const {
    name,
    lastname,
    phone,
    bio,
    nativeLanguage,
    otherLanguages,
  } = body;

  if (!name || !lastname || !phone || !bio || !nativeLanguage) {
    console.warn('⚠️ Missing fields');
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  try {
    const user = await User.findOne({ email: session.user.email });
    console.log('🔍 Found user:', user?.email);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    user.name = name;
    user.lastname = lastname;
    user.phone = phone;
    user.bio = bio;
    user.language = nativeLanguage;
    user.otherLanguages = Array.isArray(otherLanguages) ? otherLanguages : [];

    await user.save();

    console.log('✅ User updated successfully');
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('🔥 Error saving step-1:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
