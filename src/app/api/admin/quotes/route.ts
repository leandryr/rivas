import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db'
import { Quote } from '@/models/Quote'
import Notification from '@/models/Notification'
import { Types } from 'mongoose'

//
// POST /api/admin/quotes
// –– Crea una nueva cotización y notifica al cliente
//
export async function POST(request: Request) {
  // 1) Conectar a BD y validar sesión admin
  await connectDB()
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Extraemos nombre completo del admin para la notificación
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

  // 3) Validaciones básicas
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
      (i.discount === undefined ||
        (typeof i.discount === 'number' && i.discount >= 0 && i.discount <= 100))
    )
  ) {
    return NextResponse.json({ error: 'Invalid items array' }, { status: 400 })
  }
  const dueDate = new Date(validUntil)
  if (isNaN(dueDate.getTime())) {
    return NextResponse.json({ error: 'Invalid validUntil date' }, { status: 400 })
  }

  // 4) Crear cotización y notificar
  try {
    const quote = await Quote.create({
      client:     clientId,
      items,
      notes,
      validUntil: dueDate,
    })
    // Populamos cliente para retornar al front
    await quote.populate('client', 'name email')

    const message = `${adminFull} envió una nueva cotización #${quote._id}`

    await Notification.create({
      userId:  clientId,
      message,
      read:    false,
      link:    `/client/quotes/${quote._id}`,
    })

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

//
// GET /api/admin/quotes
// –– Lista cotizaciones (filtrable por ?status=...)
//
export async function GET(request: NextRequest) {
  // 1) Conectar a BD y validar sesión admin
  await connectDB()
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2) Leer parámetro status si existe
  const url = new URL(request.url)
  const statusParam = url.searchParams.get('status') as
    | 'pending'
    | 'accepted'
    | 'rejected'
    | 'paid'
    | null

  const filter: Record<string, unknown> = {}
  if (statusParam) {
    filter.status = statusParam
  }

  // 3) Traer cotizaciones filtradas, ordenarlas y popular cliente
  let quotes
  try {
    quotes = await Quote.find(filter)
      .sort({ createdAt: -1 })
      .populate('client', 'name email')
  } catch (err: any) {
    console.error('[GET QUOTES ERROR]', err)
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    )
  }

  // 4) Mapear datos para el frontend
  const data = quotes.map(q => ({
    _id:        q._id.toString(),
    client: {
      name:  (q.client as any)?.name  ?? '',
      email: (q.client as any)?.email ?? ''
    },
    subtotal:   q.subtotal,
    taxAmount:  q.taxAmount,
    total:      q.total,
    status:     q.status,
    validUntil: q.validUntil.toISOString(),
    createdAt:  q.createdAt.toISOString(),
  }))

  return NextResponse.json(data)
}
