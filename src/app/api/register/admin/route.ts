import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const { agencyName, subdomain, email, password, confirmPassword } = await req.json();

    if (!agencyName || !subdomain || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 });
    }

    await connectDB();

    const existingUser = await User.findOne({ $or: [{ email }, { subdomain }] });

    if (existingUser) {
      return NextResponse.json({ error: 'Email or subdomain already in use.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new User({
      name: agencyName, // se usa aquí como nombre visible inicial
      agencyName,
      subdomain,
      email,
      password: hashedPassword,
      role: 'admin',
      provider: 'credentials',
      isEmailVerified: false,
      isPhoneVerified: false,
      notifications: { email: true, sms: false },
    });

    await newAdmin.save();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
