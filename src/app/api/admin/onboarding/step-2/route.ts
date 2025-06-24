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

  const { category, services, location, teamSize } = await req.json();

  if (!category || !Array.isArray(services) || services.length === 0 || !teamSize) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  try {
    await User.findOneAndUpdate(
      { email: session.user.email },
      {
        category,
        services,
        location,
        teamSize,
      },
      { new: true }
    );

    return NextResponse.json({ message: 'Step 2 data saved' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Database error', error }, { status: 500 });
  }
}
