// src/app/api/admin/quotes/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db'
import { Quote } from '@/models/Quote'
import Notification from '@/models/Notification'
import { Types } from 'mongoose'

export async function POST(request: Request) {
  // 1) Conectar a BD y validar sesión admin
  await connectDB()
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Extraemos nombre completo del admin
  const adminName = session.user.name || ''
  const adminLast = (session.user as any).lastname || ''
  const adminFull = [adminName, adminLast].filter(Boolean).join(' ')

  // 2) Parsear body
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const { clientId, items, notes, validUntil } = body

  // 3) Validaciones
  if (!clientId || !Types.ObjectId.isValid(clientId)) {
    return NextResponse.json({ error: 'Invalid or missing clientId' }, { status: 400 })
  }
  if (
    !Array.isArray(items) ||
    items.length === 0 ||
    !items.every(i =>
      typeof i.title === 'string' &&
      typeof i.price === 'number' &&
      i.price >= 0 &&
      (i.discount === undefined || (typeof i.discount === 'number' && i.discount >= 0 && i.discount <= 100))
    )
  ) {
    return NextResponse.json({ error: 'Invalid items array' }, { status: 400 })
  }
  const dueDate = new Date(validUntil)
  if (isNaN(dueDate.getTime())) {
    return NextResponse.json({ error: 'Invalid validUntil date' }, { status: 400 })
  }

  // 4) Crear la cotización y notificar al cliente
  try {
    const quote = await Quote.create({
      client:     clientId,
      items,
      notes,
      validUntil: dueDate,
    })
    await quote.populate('client', 'name email')

    // Construimos mensaje con nombre del admin
    const message = `${adminFull} envió una nueva cotización #${quote._id}`

    // Creamos la notificación
    await Notification.create({
      userId:  clientId,
      message,
      read:    false,
      link:    `/client/quotes/${quote._id}`,
    })

    // Devolver la cotización recién creada
    return NextResponse.json(quote, { status: 201 })

  } catch (err: any) {
    console.error('[CREATE QUOTE ERROR]', err)
    if (err.name === 'ValidationError') {
      return NextResponse.json(
        { error: err._message, details: err.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Solo listado de cotizaciones (opcionalmente para admin)
  await connectDB()
  try {
    const quotes = await Quote.find()
      .sort({ createdAt: -1 })
      .populate('client', 'name email')
    return NextResponse.json(quotes)
  } catch (err: any) {
    console.error('[GET QUOTES ERROR]', err)
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    )
  }
}
