import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { theme, currency, timezone, onboardingCompleted } = await req.json();

  if (!theme || !currency || !timezone || onboardingCompleted !== true) {
    return NextResponse.json({ message: 'Missing or invalid data' }, { status: 400 });
  }

  try {
    await User.findOneAndUpdate(
      { email: session.user.email },
      {
        theme,
        currency,
        timezone,
        settings: {}, // puedes agregar más cosas si luego hay más configuraciones
        onboardingCompleted: true,
      },
      { new: true }
    );

    return NextResponse.json({ message: 'Step 3 completed' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Database error', error }, { status: 500 });
  }
}
