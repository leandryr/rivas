import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  await connectDB();
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const user = await User.findOne({ email: session.user.email }).lean();

  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  const {
    name,
    lastname,
    email,
    phone,
    bio,
    agencyName,
    subdomain,
    location,
    category,
    services,
    teamSize,
    avatar,
  } = user;

  return NextResponse.json({
    user: {
      name,
      lastname,
      email,
      phone,
      bio,
      agencyName,
      subdomain,
      location,
      category,
      services,
      teamSize,
      avatar,
    },
  });
}

export async function PUT(req: Request) {
  await connectDB();
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  const {
    name,
    lastname,
    phone,
    bio,
    agencyName,
    location,
    category,
    services,
    teamSize,
    avatar,
  } = body;

  try {
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    user.name = name || user.name;
    user.lastname = lastname || user.lastname;
    user.phone = phone || user.phone;
    user.bio = bio || user.bio;
    user.agencyName = agencyName || user.agencyName;
    user.location = location || user.location;
    user.category = category || user.category;
    user.services = Array.isArray(services) ? services : user.services;
    user.teamSize = teamSize || user.teamSize;
    user.avatar = avatar || user.avatar;

    await user.save();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('❌ Error updating admin profile:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
