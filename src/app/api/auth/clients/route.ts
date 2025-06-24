import connectDB from '@/lib/db'
import User from '@/models/User'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await connectDB()
    const clients = await User.find({ role: 'client' }).select('_id name lastname').lean()

    const mapped = clients.map(client => ({
      _id: client._id,
      name: `${client.name} ${client.lastname || ''}`.trim()
    }))

    return NextResponse.json({ clients: mapped })
  } catch (error) {
    console.error('[GET /clients] Error:', error)
    return NextResponse.json({ error: 'Error al obtener clientes' }, { status: 500 })
  }
}
