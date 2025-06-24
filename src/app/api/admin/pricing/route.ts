import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/db'
import { authOptions } from '@/lib/auth/auth'
import PriceItem from '@/models/PriceItem'

export async function GET() {
  await connectDB()
  const items = await PriceItem.find({}).sort({ createdAt: -1 })
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  await connectDB()
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { title, description, price, category, subcategory, unit, discount, tags } = body

  if (!title || !price || !category) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const item = await PriceItem.create({
      title: title.trim(),
      description,
      price,
      category: category.trim(),
      subcategory: subcategory?.trim(),
      unit,
      discount,
      tags,
      isActive: true,
      createdBy: session.user.email,
    })
    return NextResponse.json(item, { status: 201 })
  } catch (err) {
    console.error('[❌ Create PriceItem]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
