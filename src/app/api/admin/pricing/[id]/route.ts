import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db'
import PriceItem from '@/models/PriceItem'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectDB()
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params
  const body = await req.json()
  const { title, description, price, category, subcategory, unit, discount, tags } = body

  if (!title || !price || !category) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const updatedItem = await PriceItem.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        description,
        price,
        category: category.trim(),
        subcategory: subcategory?.trim(),
        unit,
        discount,
        tags,
      },
      { new: true }
    )

    if (!updatedItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json(updatedItem)
  } catch (err) {
    console.error('[❌ Update PriceItem]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await connectDB()
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params

  try {
    const deletedItem = await PriceItem.findByIdAndDelete(id)

    if (!deletedItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Item deleted successfully' })
  } catch (err) {
    console.error('[❌ Delete PriceItem]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}