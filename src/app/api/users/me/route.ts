// src/app/api/users/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import User, { IUser } from '@/models/User';

type PublicUser = {
  id: string;
  name: string;
  lastname?: string;
  company?: string;
  email: string;
  provider: 'credentials' | 'google' | 'github';
  phone?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  avatar?: string;
  bio?: string;
  language?: string;
  notifications: {
    email: boolean;
    sms: boolean;
  };
  theme: 'light' | 'dark';
  createdAt: Date;
  updatedAt: Date;
};

type ErrorResponse = { message: string };
type SuccessResponse = { user: PublicUser };

const JWT_SECRET = process.env.NEXTAUTH_SECRET!;

/**
 * Helper: given a NextAuth JWT token payload, find-or-create a corresponding User document.
 * - If token.id exists and is a valid Mongo ObjectId, tries to find by _id.
 * - Otherwise, uses token.email to find or create a User.
 */
async function findOrCreateUserFromToken(token: any): Promise<IUser | null> {
  // 1) If token.id exists and is a valid ObjectId, try to find by _id
  if (token.id && typeof token.id === 'string' && mongoose.Types.ObjectId.isValid(token.id)) {
    const byId = (await User.findById(token.id)) as IUser | null;
    if (byId) return byId;
  }

  // 2) If token.email exists, try to find by email
  if (token.email && typeof token.email === 'string') {
    const emailLower = token.email.toLowerCase();
    let byEmail = (await User.findOne({ email: emailLower })) as IUser | null;
    if (byEmail) return byEmail;

    // 3) If no user found, create a new one (Google/OAuth user)
    const newUserData: Partial<IUser> = {
      name:
        typeof token.name === 'string'
          ? token.name
          : emailLower.split('@')[0],
      email: emailLower,
      provider:
        token.provider === 'github'
          ? 'github'
          : 'google',
      role: 'client',
      isEmailVerified: true,
      avatar:
        typeof token.picture === 'string'
          ? token.picture
          : undefined,
    };

    const created = (await User.create(newUserData as IUser)) as IUser;
    return created;
  }

  // 4) Otherwise cannot identify user
  return null;
}

/**
 * GET  /api/users/me
 *   - Returns the authenticated user’s “public” data
 */
export async function GET(request: NextRequest) {
  // 1) Connect to MongoDB
  try {
    await connectDB();
  } catch (err) {
    console.error('[MongoDB Connection Error]', err);
    return NextResponse.json<ErrorResponse>(
      { message: 'Database connection error.' },
      { status: 500 }
    );
  }

  // 2) Read NextAuth JWT from cookies
  const token = await getToken({ req: request, secret: JWT_SECRET });
  if (!token) {
    return NextResponse.json<ErrorResponse>(
      { message: 'Not authenticated.' },
      { status: 401 }
    );
  }

  // 3) Find or create corresponding User document
  let userDoc: IUser | null;
  try {
    userDoc = await findOrCreateUserFromToken(token);
  } catch (err) {
    console.error('[GET /api/users/me: findOrCreate] ', err);
    return NextResponse.json<ErrorResponse>(
      { message: 'Error verifying user.' },
      { status: 500 }
    );
  }

  if (!userDoc) {
    return NextResponse.json<ErrorResponse>(
      { message: 'User not found or could not be created.' },
      { status: 404 }
    );
  }

  // 4) Build public subset
  const publicUser: PublicUser = {
    id: userDoc.id,
    name: userDoc.name,
    lastname: userDoc.lastname,
    company: userDoc.company,
    email: userDoc.email,
    provider: userDoc.provider,
    phone: userDoc.phone,
    isEmailVerified: userDoc.isEmailVerified ?? false,
    isPhoneVerified: userDoc.isPhoneVerified ?? false,
    avatar: userDoc.avatar,
    bio: userDoc.bio,
    language: userDoc.language,
    notifications: {
      email: userDoc.notifications?.email ?? true,
      sms: userDoc.notifications?.sms ?? false,
    },
    theme: userDoc.theme ?? 'light',
    createdAt: userDoc.createdAt,
    updatedAt: userDoc.updatedAt,
  };

  return NextResponse.json<SuccessResponse>({ user: publicUser }, { status: 200 });
}

/**
 * PUT /api/users/me
 *   - Updates only: name, lastname, company, phone, avatar, bio, language, notifications, theme
 *   - Does NOT modify email, provider, role, password, or settings
 */
export async function PUT(request: NextRequest) {
  // 1) Connect to MongoDB
  try {
    await connectDB();
  } catch (err) {
    console.error('[MongoDB Connection Error]', err);
    return NextResponse.json<ErrorResponse>(
      { message: 'Database connection error.' },
      { status: 500 }
    );
  }

  // 2) Read NextAuth JWT from cookies
  const token = await getToken({ req: request, secret: JWT_SECRET });
  if (!token) {
    return NextResponse.json<ErrorResponse>(
      { message: 'Not authenticated.' },
      { status: 401 }
    );
  }

  // 3) Find or create corresponding User document
  let userDoc: IUser | null;
  try {
    userDoc = await findOrCreateUserFromToken(token);
  } catch (err) {
    console.error('[PUT /api/users/me: findOrCreate] ', err);
    return NextResponse.json<ErrorResponse>(
      { message: 'Error verifying user.' },
      { status: 500 }
    );
  }

  if (!userDoc) {
    return NextResponse.json<ErrorResponse>(
      { message: 'User not found or could not be created.' },
      { status: 404 }
    );
  }

  // 4) Parse JSON body
  let body: {
    name?: unknown;
    lastname?: unknown;
    company?: unknown;
    phone?: unknown;
    avatar?: unknown;
    bio?: unknown;
    language?: unknown;
    notifications?: unknown;
    theme?: unknown;
  };

  try {
    body = await request.json();
  } catch (err) {
    return NextResponse.json<ErrorResponse>(
      { message: 'Invalid JSON body.' },
      { status: 400 }
    );
  }

  // 5) Validate “name” (required, must be string)
  if (!body.name || typeof body.name !== 'string') {
    return NextResponse.json<ErrorResponse>(
      { message: 'Field "name" is required and must be a string.' },
      { status: 400 }
    );
  }

  // 6) Build updates object
  const updates: Partial<IUser> = {
    name: (body.name as string).trim(),
    lastname:
      typeof body.lastname === 'string'
        ? (body.lastname as string).trim()
        : undefined,
    company:
      typeof body.company === 'string'
        ? (body.company as string).trim()
        : undefined,
    phone:
      typeof body.phone === 'string' ? (body.phone as string).trim() : undefined,
    avatar:
      typeof body.avatar === 'string'
        ? (body.avatar as string).trim()
        : undefined,
    bio:
      typeof body.bio === 'string' ? (body.bio as string).trim() : undefined,
    language:
      typeof body.language === 'string'
        ? (body.language as string).trim()
        : undefined,
    theme: body.theme === 'dark' ? 'dark' : 'light',
  };

  // 7) Validate notifications if provided
  if (body.notifications) {
    if (
      typeof body.notifications === 'object' &&
      body.notifications !== null &&
      typeof (body.notifications as any).email === 'boolean' &&
      typeof (body.notifications as any).sms === 'boolean'
    ) {
      updates.notifications = {
        email: (body.notifications as any).email,
        sms: (body.notifications as any).sms,
      };
    } else {
      return NextResponse.json<ErrorResponse>(
        { message: 'Field "notifications" must contain boolean values.' },
        { status: 400 }
      );
    }
  }

  // 8) Perform the update
  try {
    const updatedDoc = (await User.findByIdAndUpdate(
      userDoc.id,
      { $set: updates },
      { new: true, runValidators: true }
    )) as IUser | null;

    if (!updatedDoc) {
      return NextResponse.json<ErrorResponse>(
        { message: 'User not found during update.' },
        { status: 404 }
      );
    }

    // 9) Build updated public view
    const publicUpdated: PublicUser = {
      id: updatedDoc.id,
      name: updatedDoc.name,
      lastname: updatedDoc.lastname,
      company: updatedDoc.company,
      email: updatedDoc.email,
      provider: updatedDoc.provider,
      phone: updatedDoc.phone,
      isEmailVerified: updatedDoc.isEmailVerified ?? false,
      isPhoneVerified: updatedDoc.isPhoneVerified ?? false,
      avatar: updatedDoc.avatar,
      bio: updatedDoc.bio,
      language: updatedDoc.language,
      notifications: {
        email: updatedDoc.notifications?.email ?? true,
        sms: updatedDoc.notifications?.sms ?? false,
      },
      theme: updatedDoc.theme ?? 'light',
      createdAt: updatedDoc.createdAt,
      updatedAt: updatedDoc.updatedAt,
    };

    return NextResponse.json<SuccessResponse>(
      { user: publicUpdated },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('[PUT /api/users/me] ', err);

    if (err.name === 'ValidationError') {
      return NextResponse.json<ErrorResponse>(
        { message: err.message },
        { status: 400 }
      );
    }

    return NextResponse.json<ErrorResponse>(
      { message: 'Error updating profile.' },
      { status: 500 }
    );
  }
}
