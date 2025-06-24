// src/app/api/client/invoices/[id]/route.ts
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Invoice } from '@/models/Invoice'
import User from '@/models/User'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth'
import { Types } from 'mongoose'

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB()
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) 
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dbUser = await User.findOne({ email: session.user.email }).select('_id')
  const { id } = await context.params
  if (!Types.ObjectId.isValid(id)) 
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const inv = await Invoice.findOne({ _id: id, client: dbUser!._id })
  if (!inv) 
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(inv)
}
